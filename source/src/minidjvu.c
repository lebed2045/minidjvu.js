/*
 * minidjvu.c - an example of using the library
 */

#include <minidjvu.h>
#include <mdjvucfg.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <math.h>
#include <assert.h>
#include <locale.h>

/* TODO: remove duplicated code */


/* options */
int32 dpi = 300;
int32 pages_per_dict = 10; /* 0 means infinity */
int dpi_specified = 0;
int verbose = 0;
int smooth = 0;
int averaging = 0;
int match = 0;
int Match = 0;
int aggression = 100;
int erosion = 0;
int clean = 0;
int report = 0;
int no_prototypes = 0;
int warnings = 0;
int indirect = 0;
char* dict_suffix = NULL;

/* ========================================================================= */

/* file name template routines (for multipage encoding) {{{ */

static int get_ext_delim_pos(const char *fname)
{
    int pos = strcspn(fname,".");
    int last = 0;
    
    while (last + pos != strlen(fname))
    {
        last += (pos + 1);
        pos = strcspn(fname + last,".");
    }
    return last;
}

static char *get_page_or_dict_name(char **elements, int cnt, const char *fname)
{
    int i, extpos, same=-1;
    char *page_name, *pattern;
    
    extpos = get_ext_delim_pos(fname);
    page_name = MDJVU_MALLOCV(char, extpos + 10);
    memset(page_name,'\0',extpos + 6);
    if (extpos > 0)
        strncpy(page_name, fname, extpos-1);
    strcat(page_name, ".djvu");

    for (i=0; i<cnt; i++ )
    {
        if (strcmp(page_name, elements[i]) == 0)
        {
            same = i;
            break;
        }
    }
    
    if (same != -1)
    {
        int previdx=0, idx=0, res;
        /* discard the extension */
        page_name[extpos-1] = '\0';
        
        pattern = MDJVU_MALLOCV(char, extpos + 10);
        strcpy(pattern, page_name);
        strcat(pattern, "#%d.");

        for (i=same; i<cnt; i++)
        {
            if (ends_with_ignore_case(elements[i],".djvu"))
            {
                res = sscanf(elements[i],pattern,&idx);
                if (res && idx > previdx) previdx = idx;
            }
        }
        if (idx == 999)
        {
            fprintf(stderr, _("Cannot generate a unique name for %s\n"), fname);
            exit(1);
        }
        sprintf(page_name + (extpos - 1),"#%03d.djvu",idx+1);
        MDJVU_FREEV(pattern);
    }
    return(page_name);
}

static void replace_suffix(char *name, const char *suffix)
{
    int len = strlen(name);
    
    name[len-4] = '\0';
    strcat(name, suffix);
}

/* file name template routines (for multipage encoding) }}} */

/* ========================================================================= */

static void show_usage_and_exit(void)           /* {{{ */
{
    const char *what_it_does = _("encode/decode bitonal DjVu files");
    if (strcmp(MDJVU_VERSION, mdjvu_get_version()))
    {
        printf(_("minidjvu - %s\n"), what_it_does);
        printf(_("Warning: program and library version mismatch:\n"));
        printf(_("    program version %s, library version %s.\n\n"), MDJVU_VERSION, mdjvu_get_version());

    }
    else
    {
        printf("minidjvu %s - %s\n", MDJVU_VERSION, what_it_does);

    }
    printf(_("Usage:\n"));
    printf(_("single page encoding/decoding:\n"));
    printf(_("    minidjvu [options] <input file> <output file>\n"));
    printf(_("multiple pages encoding:\n"));
    printf(_("    minidjvu [options] <input file> ... <output file>\n"));
    printf(_("Formats supported:\n"));

    printf(_("    DjVu (single-page bitonal), PBM, Windows BMP"));
    if (mdjvu_have_tiff_support())
        printf(_(", TIFF.\n"));
    else
        printf(_("; TIFF support is OFF.\n"));

    printf(_("Options:\n"));
    printf(_("    -A, --Averaging:               compute \"average\" representatives\n"));
    printf(_("    -a <n>, --aggression <n>:      set aggression level (default 100)\n"));
    printf(_("    -c, --clean                    remove small black pieces\n"));
    printf(_("    -d <n> --dpi <n>:              set resolution in dots per inch\n"));
    printf(_("    -e, --erosion                  sacrifice quality to gain in size\n"));
    printf(_("    -i, --indirect:                generate an indirect multipage document\n"));
    printf(_("    -l, --lossy:                   use all lossy options (-s -c -m -e -A)\n"));
    printf(_("    -m, --match:                   match and substitute patterns\n"));
    printf(_("    -n, --no-prototypes:           do not search for prototypes\n"));
    printf(_("    -p <n>, --pages-per-dict <n>:  pages per dictionary (default 10)\n"));
    printf(_("    -r, --report:                  report multipage coding progress\n"));
    printf(_("    -s, --smooth:                  remove some badly looking pixels\n"));
    printf(_("    -v, --verbose:                 print messages about everything\n"));
    printf(_("    -X, --Xtension:                file extension for shared dictionary files\n"));
    printf(_("    -w, --warnings:                do not suppress TIFF warnings\n"));
    printf(_("See the man page for detailed description of each option.\n"));
    exit(2);
}                   /* }}} */

static int decide_if_bmp(const char *path)
{
    return ends_with_ignore_case(path, ".bmp");
}

static int decide_if_djvu(const char *path)
{
    return ends_with_ignore_case(path, ".djvu")
        || ends_with_ignore_case(path, ".djv");
}

static int decide_if_tiff(const char *path)
{
    return ends_with_ignore_case(path, ".tiff")
        || ends_with_ignore_case(path, ".tif");
}

/* ========================================================================= */

static mdjvu_image_t load_image(const char *path)
{
    mdjvu_error_t error;
    mdjvu_image_t image;

    if (verbose) printf(_("loading a DjVu page from `%s'\n"), path);
    image = mdjvu_load_djvu_page(path, &error);
    if (!image)
    {
        fprintf(stderr, "%s: %s\n", path, mdjvu_get_error_message(error));
        exit(1);
    }
    if (verbose)
    {
        printf(_("loaded; the page has %d bitmaps and %d blits\n"),
               mdjvu_image_get_bitmap_count(image),
               mdjvu_image_get_blit_count(image));
    }
    return image;
}

static mdjvu_matcher_options_t get_matcher_options(void)
{
    mdjvu_matcher_options_t m_options = NULL;
    if (match || Match)
    {
        m_options = mdjvu_matcher_options_create();
        mdjvu_use_matcher_method(m_options, MDJVU_MATCHER_PITH_2);
        if (Match)
            mdjvu_use_matcher_method(m_options, MDJVU_MATCHER_RAMPAGE);
        mdjvu_set_aggression(m_options, aggression);
    }
    return m_options;
}

static void sort_and_save_image(mdjvu_image_t image, const char *path)
{
    mdjvu_error_t error;

    mdjvu_compression_options_t options = mdjvu_compression_options_create();
    mdjvu_set_matcher_options(options, get_matcher_options());

    mdjvu_set_clean(options, clean);
    mdjvu_set_verbose(options, verbose);
    mdjvu_set_no_prototypes(options, no_prototypes);
    mdjvu_set_averaging(options, averaging);
    mdjvu_compress_image(image, options);
    mdjvu_compression_options_destroy(options);

    if (verbose) printf(_("encoding to `%s'\n"), path);

    if (!mdjvu_save_djvu_page(image, path, NULL, &error, erosion))
    {
        fprintf(stderr, "%s: %s\n", path, mdjvu_get_error_message(error));
        exit(1);
    }
}

static mdjvu_bitmap_t load_bitmap(const char *path, int tiff_idx)
{
    mdjvu_error_t error;
    mdjvu_bitmap_t bitmap;

    if (decide_if_bmp(path))
    {
        if (verbose) printf(_("loading from Windows BMP file `%s'\n"), path);
        bitmap = mdjvu_load_bmp(path, &error);
    }
    else if (decide_if_tiff(path))
    {
        if (verbose) printf(_("loading from TIFF file `%s'\n"), path);
        if (!warnings)
            mdjvu_disable_tiff_warnings();
        if (dpi_specified)
            bitmap = mdjvu_load_tiff(path, NULL, &error, tiff_idx);
        else
            bitmap = mdjvu_load_tiff(path, &dpi, &error, tiff_idx);
        if (verbose) printf(_("resolution is %d dpi\n"), dpi);
    }
    else if (decide_if_djvu(path))
    {
        mdjvu_image_t image = load_image(path);
        bitmap = mdjvu_render(image);
        mdjvu_image_destroy(image);
        if (verbose)
        {
            printf(_("bitmap %d x %d rendered\n"),
                   mdjvu_bitmap_get_width(bitmap),
                   mdjvu_bitmap_get_height(bitmap));
        }
    }
    else
    {
        if (verbose) printf(_("loading from PBM file `%s'\n"), path);
        bitmap = mdjvu_load_pbm(path, &error);
    }

    if (!bitmap)
    {
        fprintf(stderr, "%s: %s\n", path, mdjvu_get_error_message(error));
        exit(1);
    }

    if (smooth)
    {
        if (verbose) printf(_("smoothing the bitmap\n"));
        mdjvu_smooth(bitmap);
    }

    return bitmap;
}

static void save_bitmap(mdjvu_bitmap_t bitmap, const char *path)
{
    mdjvu_error_t error;
    int result;

    if (decide_if_bmp(path))
    {
        if (verbose) printf(_("saving to Windows BMP file `%s'\n"), path);
        result = mdjvu_save_bmp(bitmap, path, dpi, &error);
    }
    else if (decide_if_tiff(path))
    {
        if (verbose) printf(_("saving to TIFF file `%s'\n"), path);
        if (!warnings)
            mdjvu_disable_tiff_warnings();
        result = mdjvu_save_tiff(bitmap, path, &error);
    }
    else
    {
        if (verbose) printf(_("saving to PBM file `%s'\n"), path);
        result = mdjvu_save_pbm(bitmap, path, &error);
    }

    if (!result)
    {
        fprintf(stderr, "%s: %s\n", path, mdjvu_get_error_message(error));
        exit(1);
    }
}

/* ========================================================================= */

static void decode(int argc, char **argv)
{
    mdjvu_image_t image;
    mdjvu_bitmap_t bitmap;

    if (verbose) printf(_("\nDECODING\n"));
    if (verbose) printf(_("________\n\n"));

    image = load_image(argv[1]);
    bitmap = mdjvu_render(image);
    mdjvu_image_destroy(image);

    if (verbose)
    {
        printf(_("bitmap %d x %d rendered\n"),
               mdjvu_bitmap_get_width(bitmap),
               mdjvu_bitmap_get_height(bitmap));
    }

    if (smooth)
    {
        if (verbose) printf(_("smoothing the bitmap\n"));
        mdjvu_smooth(bitmap);
    }

    save_bitmap(bitmap, argv[2]);
    mdjvu_bitmap_destroy(bitmap);
}

static mdjvu_image_t split_and_destroy(mdjvu_bitmap_t bitmap)
{
    mdjvu_image_t image;
    if (verbose) printf(_("splitting the bitmap into pieces\n"));
    image = mdjvu_split(bitmap, dpi, /* options:*/ NULL);
    mdjvu_bitmap_destroy(bitmap);
    if (verbose)
    {
        printf(_("the splitted image has %d pieces\n"),
                mdjvu_image_get_blit_count(image));
    }
    if (clean)
    {
        if (verbose) printf(_("cleaning\n"));
        mdjvu_clean(image);
        if (verbose)
        {
            printf(_("the cleaned image has %d pieces\n"),
                    mdjvu_image_get_blit_count(image));
        }
    }
    return image;
}


static void encode(int argc, char **argv)
{
    mdjvu_bitmap_t bitmap;
    mdjvu_image_t image;

    if (verbose) printf(_("\nENCODING\n"));
    if (verbose) printf(_("________\n\n"));

    bitmap = load_bitmap(argv[1], 0);

    image = split_and_destroy(bitmap);
    sort_and_save_image(image, argv[2]);
    mdjvu_image_destroy(image);
}


/* Filtering is nondjvu->nondjvu job. */
static void filter(int argc, char **argv)
{
    mdjvu_bitmap_t bitmap;

    if (verbose) printf(_("\nFILTERING\n"));
    if (verbose) printf(_("_________\n\n"));

    bitmap = load_bitmap(argv[1], 0);
    save_bitmap(bitmap, argv[2]);
    mdjvu_bitmap_destroy(bitmap);
}


static const char *strip(const char *str, char sep)
{
    const char *t = strrchr(str, sep);
    if (t)
        return t + 1;
    else
        return str;
}

/* return path without a directory name */ 
static const char *strip_dir(const char *path)
{
    return strip(strip(path, '\\'), '/');
}


static void multipage_encode(int n, char **pages, char *outname, uint32 multipage_tiff)
{
    mdjvu_image_t *images;
    mdjvu_image_t dict;
    int i, el = 0;
    int ndicts = (n % pages_per_dict > 0) ? (int) fabs( n/pages_per_dict) + 1:
                                            (int) fabs( n/pages_per_dict);
    char *dict_name, *path;
    char **elements = MDJVU_MALLOCV(char *, n + ndicts);
    int  *sizes     = MDJVU_MALLOCV(int, n + ndicts);
    mdjvu_compression_options_t options;
    mdjvu_bitmap_t bitmap;
    mdjvu_error_t error;
    int32 pages_compressed;
    FILE *f, *tf=NULL;

    match = 1;

    if (!ends_with_ignore_case(outname, ".djv") && !ends_with_ignore_case(outname, ".djvu"))
    {
        fprintf(stderr, _("when encoding many pages, output file must be DjVu\n"));
        exit(1);
    }
    if (!indirect)
    {
        tf = tmpfile();
        if (!tf)
        {
            fprintf(stderr, _("Could not create a temporary file\n"));
            exit(1);
        }
    }

    if (verbose) printf(_("\nMULTIPAGE ENCODING\n"));
    if (verbose) printf(_("__________________\n\n"));
    if (verbose) printf(_("%d pages total\n"), n);

    options = mdjvu_compression_options_create();
    mdjvu_set_matcher_options(options, get_matcher_options());

    mdjvu_set_clean(options, clean);
    mdjvu_set_verbose(options, verbose);
    mdjvu_set_no_prototypes(options, no_prototypes);
    mdjvu_set_report(options, report);
    mdjvu_set_averaging(options, averaging);
    mdjvu_set_report_total_pages(options, n);

    /* compressing */
    if (pages_per_dict <= 0) pages_per_dict = n;
    if (pages_per_dict > n) pages_per_dict = n;
    images = MDJVU_MALLOCV(mdjvu_image_t, pages_per_dict);
    pages_compressed = 0;

    while (n - pages_compressed)
    {
        int32 pages_to_compress = n - pages_compressed;
        if (pages_to_compress > pages_per_dict)
            pages_to_compress = pages_per_dict;

        mdjvu_set_report_start_page(options, pages_compressed + 1);

        for (i = 0; i < pages_to_compress; i++)
        {
            if (multipage_tiff)
                bitmap = load_bitmap(pages[0], pages_compressed + i);
            else
                bitmap = load_bitmap(pages[pages_compressed + i], 0);
            images[i] = split_and_destroy(bitmap);
            if (report)
                printf(_("Loading: %d of %d completed\n"), pages_compressed + i + 1, n);
        }

        dict = mdjvu_compress_multipage(pages_to_compress, images, options);

        path = get_page_or_dict_name(elements, el, strip_dir(pages[multipage_tiff ? 0 : pages_compressed]));
        dict_name = MDJVU_MALLOCV(char, strlen(path) + strlen(dict_suffix) - 2);
        strcpy(dict_name, path);
        replace_suffix(dict_name, dict_suffix);
        
        if (!indirect)
            sizes[el] = mdjvu_file_save_djvu_dictionary(dict, (mdjvu_file_t) tf, 0, &error, erosion);
        else
            sizes[el] = mdjvu_save_djvu_dictionary(dict, dict_name, &error, erosion);
        
        if (!sizes[el])
        {
            fprintf(stderr, "%s: %s\n", dict_name, mdjvu_get_error_message(error));
            exit(1);
        }
        elements[el++] = dict_name;

        for (i = 0; i < pages_to_compress; i++)
        {
            if (i > 0)
                path = get_page_or_dict_name(elements, el, strip_dir(pages[multipage_tiff ? 0 : pages_compressed + i]));

            if (verbose)
                printf(_("saving page #%d into %s using dictionary %s\n"), pages_compressed + i + 1, path, dict_name);
            
            if (!indirect)
                sizes[el] = mdjvu_file_save_djvu_page(images[i], (mdjvu_file_t) tf, strip_dir(dict_name), 0, &error, erosion);
            else
                sizes[el] = mdjvu_save_djvu_page(images[i], path, strip_dir(dict_name), &error, erosion);
            if (!sizes[el])
            {
                fprintf(stderr, "%s: %s\n", path, mdjvu_get_error_message(error));
                exit(1);
            }
            elements[el++] = path;
            mdjvu_image_destroy(images[i]);
            if (report)
                printf(_("Saving: %d of %d completed\n"), pages_compressed + i + 1, n);
        }
        mdjvu_image_destroy(dict);
        pages_compressed += pages_to_compress;
    }
    if (!indirect)
    {
        f = fopen(outname, "wb");
        if (!f)
        {
            fprintf(stderr, "%s: %s\n", outname, (const char *) mdjvu_get_error(mdjvu_error_fopen_write));
            exit(1);
        }
        mdjvu_file_save_djvu_dir(elements, sizes, el, (mdjvu_file_t) f, (mdjvu_file_t) tf, &error);
        fclose(tf);
        fclose(f);
    }
    else
        mdjvu_save_djvu_dir(elements,sizes,el,outname,&error);
    
    for (i=0; i<el; i++) MDJVU_FREEV(elements[i]);
    MDJVU_FREEV(elements);
    MDJVU_FREEV(sizes);

    /* destroying */
    mdjvu_compression_options_destroy(options);

    MDJVU_FREEV(images);
}

/* same_option(foo, "opt") returns 1 in three cases:
 *
 *      foo is "o" (first letter of opt)
 *      foo is "opt"
 *      foo is "-opt"
 */
static int same_option(const char *option, const char *s)
{
    if (option[0] == s[0] && !option[1]) return 1;
    if (!strcmp(option, s)) return 1;
    if (option[0] == '-' && !strcmp(option + 1, s)) return 1;
    return 0;
}

static int process_options(int argc, char **argv)
{
    int i;
    for (i = 1; i < argc && argv[i][0] == '-'; i++)
    {
        char *option = argv[i] + 1;
        if (same_option(option, "verbose"))
            verbose = 1;
        else if (same_option(option, "smooth"))
            smooth = 1;
        else if (same_option(option, "match"))
            match = 1;
        else if (same_option(option, "Match"))
            Match = 1;
        else if (same_option(option, "no-prototypes"))
            no_prototypes = 1;
        else if (same_option(option, "erosion"))
            erosion = 1;
        else if (same_option(option, "clean"))
            clean = 1;
        else if (same_option(option, "warnings"))
            warnings = 1;
        else if (same_option(option, "report"))
            report = 1;
        else if (same_option(option, "Averaging"))
            averaging = 1;
        else if (same_option(option, "lossy"))
        {
            smooth = 1;
            match = 1;
            erosion = 1;
            clean = 1;
            averaging = 1;
        }
        else if (same_option(option, "Lossy"))
        {
            smooth = 1;
            Match = match = 1;
            erosion = 1;
            clean = 1;
            averaging = 1;
        }
        else if (same_option(option, "pages-per-dict"))
        {
            i++;
            if (i == argc) show_usage_and_exit();
            pages_per_dict = atoi(argv[i]);
            if (pages_per_dict <= 0)
            {
                fprintf(stderr, _("bad --pages-per-dict value\n"));
                exit(2);
            }
        }
        else if (same_option(option, "dpi"))
        {
            i++;
            if (i == argc) show_usage_and_exit();
            dpi = atoi(argv[i]);
            dpi_specified = 1;
            if (dpi < 20 || dpi > 2000)
            {
                fprintf(stderr, _("bad resolution\n"));
                exit(2);
            }
        }
        else if (same_option(option, "aggression"))
        {
            i++;
            if (i == argc) show_usage_and_exit();
            aggression = atoi(argv[i]);
            match = 1;
        }
        else if (same_option(option, "Xtension"))
        {
            i++;
            if (i == argc) show_usage_and_exit();
            dict_suffix = argv[i];
        }
        else if (same_option(option, "indirect"))
            indirect = 1;
        else
        {
            fprintf(stderr, _("unknown option: %s\n"), argv[i]);
            exit(2);
        }
    }
    return i;
}




//==================for minidjvu.js========================
static	mdjvu_image_t image;    /* a sequence of blits (what is stored in DjVu) */
static	mdjvu_bitmap_t bitmap;  /* the result                                   */
static int qwe_loadrender_djvu_calls = 0;
static int32 qwe_djvu_width_var  = 0;
static int32 qwe_djvu_height_var = 0;
static int32 temp;


static int32 qwe_djvu_width()
{
	return qwe_djvu_width_var;
}
static int32 qwe_djvu_height()
{
	return qwe_djvu_height_var;
}

static void qwe_loadrender_djvu()
{
	qwe_loadrender_djvu_calls++;
	image = load_image("djvu");	
	bitmap = mdjvu_render(image);
	
	qwe_djvu_width_var  = mdjvu_image_get_width(image);
	qwe_djvu_height_var  = mdjvu_image_get_height(image);
	temp = qwe_djvu_width();
	temp = qwe_djvu_height();
}

static void qwe_save_djvu()
{	 
	mdjvu_image_destroy(image);
	save_bitmap(bitmap, "/bmp.bmp");
	mdjvu_bitmap_destroy(bitmap);
}

#include <stdio.h>
#include <emscripten.h>

int main(int argc, char *argv[]) { 	
	qwe_loadrender_djvu();
	qwe_save_djvu();
	return 0;
}
