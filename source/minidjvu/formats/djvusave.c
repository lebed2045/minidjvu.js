/*
 * djvusave.c - saving DjVuBitonal pages
 */

#include "mdjvucfg.h"
#include "minidjvu.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

MDJVU_IMPLEMENT int mdjvu_file_save_djvu_dir(char **elements, int *sizes,
    int n, mdjvu_file_t file, mdjvu_file_t tempfile, mdjvu_error_t *perr)
{
    mdjvu_iff_t FORM, DIRM;

    mdjvu_write_big_endian_int32(MDJVU_IFF_ID("AT&T"), file);
    FORM = mdjvu_iff_write_chunk(MDJVU_IFF_ID("FORM"), file);
        mdjvu_write_big_endian_int32(MDJVU_IFF_ID("DJVM"), file);

        DIRM = mdjvu_iff_write_chunk(MDJVU_IFF_ID("DIRM"), file);
            if (tempfile)
                mdjvu_write_dirm_bundled(elements, sizes, n, file, perr);
            else
                mdjvu_write_dirm_indirect(elements, sizes, n, file, perr);
        mdjvu_iff_close_chunk(DIRM, file);
        
        if (tempfile)
        {
            int i, fpos, tpos;
            tpos = ftell((FILE *) tempfile);
            fpos = ftell((FILE *) file);
            
            if (fpos & 1) fputc('\0', (FILE *) file);
            rewind((FILE *) tempfile);
            
            for( i=0; i<tpos; i++)
            {
                char ch = fgetc((FILE *) tempfile);
                fputc(ch, (FILE *) file);
            }
        }

    mdjvu_iff_close_chunk(FORM, file);

    return 1;
}

MDJVU_IMPLEMENT int mdjvu_file_save_djvu_page(mdjvu_image_t image, mdjvu_file_t file,
    const char *dict_name, int indirect, mdjvu_error_t *perr, int erosion)
{
    mdjvu_iff_t FORM, INFO, INCL, Sjbz;
    int pos = ftell((FILE *) file);
    if (pos & 1) pos++;

    if (indirect)
        mdjvu_write_big_endian_int32(MDJVU_IFF_ID("AT&T"), file);
    FORM = mdjvu_iff_write_chunk(MDJVU_IFF_ID("FORM"), file);
        mdjvu_write_big_endian_int32(MDJVU_IFF_ID("DJVU"), file);

        INFO = mdjvu_iff_write_chunk(MDJVU_IFF_ID("INFO"), file);
            mdjvu_write_info_chunk(file, image);
        mdjvu_iff_close_chunk(INFO, file);

        if (dict_name)
        {
            INCL = mdjvu_iff_write_chunk(MDJVU_IFF_ID("INCL"), file);
                fwrite(dict_name, 1, strlen(dict_name), (FILE *) file);
            mdjvu_iff_close_chunk(INCL, file);
        }

        Sjbz = mdjvu_iff_write_chunk(MDJVU_IFF_ID("Sjbz"), file);
            if (!mdjvu_file_save_jb2(image, file, perr, erosion)) return 0;
        mdjvu_iff_close_chunk(Sjbz, file);
    mdjvu_iff_close_chunk(FORM, file);

    pos = ftell((FILE *) file) - pos;
    return pos;
}


MDJVU_IMPLEMENT int mdjvu_file_save_djvu_dictionary(mdjvu_image_t image,
    mdjvu_file_t file, int indirect, mdjvu_error_t *perr, int erosion)
{
    mdjvu_iff_t FORM, Djbz;
    int pos = ftell((FILE *) file);
    if (pos & 1) pos++;

    if (indirect)
        mdjvu_write_big_endian_int32(MDJVU_IFF_ID("AT&T"), file);
    FORM = mdjvu_iff_write_chunk(MDJVU_IFF_ID("FORM"), file);
        mdjvu_write_big_endian_int32(MDJVU_IFF_ID("DJVI"), file);

        Djbz = mdjvu_iff_write_chunk(MDJVU_IFF_ID("Djbz"), file);
            if (!mdjvu_file_save_jb2_dictionary(image, file, perr, erosion))
                return 0;
        mdjvu_iff_close_chunk(Djbz, file);
    mdjvu_iff_close_chunk(FORM, file);

    pos = ftell((FILE *) file) - pos;
    return pos;
}

MDJVU_IMPLEMENT int mdjvu_save_djvu_dir(char **elements, int *sizes, int n, const char *path, mdjvu_error_t *perr)
{
    int result;
    FILE *f = fopen(path, "wb");
    if (perr) *perr = NULL;
    if (!f)
    {
        if (perr) *perr = mdjvu_get_error(mdjvu_error_fopen_write);
        return 0;
    }
    result = mdjvu_file_save_djvu_dir(elements, sizes, n, (mdjvu_file_t) f, NULL, perr);
    fclose(f);
    return result;
}

MDJVU_IMPLEMENT int mdjvu_save_djvu_page(mdjvu_image_t image, const char *path, const char *dict, mdjvu_error_t *perr, int erosion)
{
    int result;
    FILE *f = fopen(path, "wb");
    if (perr) *perr = NULL;
    if (!f)
    {
        if (perr) *perr = mdjvu_get_error(mdjvu_error_fopen_write);
        return 0;
    }
    result = mdjvu_file_save_djvu_page(image, (mdjvu_file_t) f, dict, 0, perr, erosion);
    fclose(f);
    return result;
}

MDJVU_IMPLEMENT int mdjvu_save_djvu_dictionary(mdjvu_image_t image, const char *path, mdjvu_error_t *perr, int erosion)
{
    int result;
    FILE *f = fopen(path, "wb");
    if (perr) *perr = NULL;
    if (!f)
    {
        if (perr) *perr = mdjvu_get_error(mdjvu_error_fopen_write);
        return 0;
    }
    result = mdjvu_file_save_djvu_dictionary(image, (mdjvu_file_t) f, 0, perr, erosion);
    fclose(f);
    return result;
}
