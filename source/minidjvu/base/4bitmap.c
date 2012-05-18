/*
 * 4bitmap.c - routines for handling packed bitmaps
 */

#include "mdjvucfg.h"
#include "minidjvu.h"
#include <stdlib.h>
#include <string.h>
#include <assert.h>

typedef struct
{
    unsigned char **data;
    int32 width, height;
    int32 index;
} Bitmap;


#ifndef NDEBUG
int32 alive_bitmap_counter = 0;
#endif

#define BYTES_PER_ROW(WIDTH) (((WIDTH) + 7) >> 3)

/* __________________________   create/destroy   ___________________________ */

MDJVU_IMPLEMENT mdjvu_bitmap_t mdjvu_bitmap_create(int32 width, int32 height)
{
    Bitmap *b = (Bitmap *) malloc(sizeof(Bitmap));
    #ifndef NDEBUG
        alive_bitmap_counter++;
    #endif
    b->width = width;
    b->height = height;
    b->index = -1;
    b->data = mdjvu_create_2d_array(BYTES_PER_ROW(width), height);
    return (mdjvu_bitmap_t) b;
}

MDJVU_IMPLEMENT void mdjvu_bitmap_destroy(mdjvu_bitmap_t bmp)
{
    Bitmap *b = (Bitmap *) bmp;
    #ifndef NDEBUG
        alive_bitmap_counter--;
    #endif
    mdjvu_destroy_2d_array(b->data);
    free(b);
}

/* __________________________   clone & assign   ___________________________ */

#define BMP ((Bitmap *) b)
#define ROW_SIZE BYTES_PER_ROW(BMP->width)

MDJVU_IMPLEMENT mdjvu_bitmap_t mdjvu_bitmap_clone(mdjvu_bitmap_t b)
{
    mdjvu_bitmap_t result = mdjvu_bitmap_create(BMP->width, BMP->height);

    /* Using the fact that the 2d arrays by 2d_array() are really 1d ones */
    memcpy(((Bitmap *) result)->data[0], BMP->data[0], ROW_SIZE * BMP->height);
    return result;
}

MDJVU_IMPLEMENT void mdjvu_bitmap_assign(mdjvu_bitmap_t dst, mdjvu_bitmap_t b)
{
    mdjvu_destroy_2d_array(((Bitmap *)dst)->data);
    ((Bitmap *)dst)->data =
        mdjvu_create_2d_array(BYTES_PER_ROW(BMP->width), BMP->height);
    ((Bitmap *)dst)->width = BMP->width;
    ((Bitmap *)dst)->height = BMP->height;
    memcpy(((Bitmap *) dst)->data[0], BMP->data[0], ROW_SIZE * BMP->height);
}

MDJVU_IMPLEMENT void mdjvu_bitmap_exchange(mdjvu_bitmap_t d, mdjvu_bitmap_t src)
{
    int32 d_index_backup = ((Bitmap *) d)->index;
    int32 s_index_backup = ((Bitmap *) src)->index;
    Bitmap tmp = * (Bitmap *) d;
    * (Bitmap *) d = * (Bitmap *) src;
    * (Bitmap *) src = tmp;
    ((Bitmap *) d)->index = d_index_backup;
    ((Bitmap *) src)->index = s_index_backup;
}


/* __________________________   getters/setters   __________________________ */


MDJVU_IMPLEMENT int32 mdjvu_bitmap_get_width(mdjvu_bitmap_t b)
{
    return BMP->width;
}

MDJVU_IMPLEMENT int32 mdjvu_bitmap_get_height(mdjvu_bitmap_t b)
{
    return BMP->height;
}

MDJVU_IMPLEMENT int32 mdjvu_bitmap_get_index(mdjvu_bitmap_t b)
{
    if (b)
        return BMP->index;
    else
        return -1;
}

MDJVU_IMPLEMENT void mdjvu_bitmap_set_index(mdjvu_bitmap_t b, int32 v)
{
    BMP->index = v;
}

MDJVU_IMPLEMENT int32 mdjvu_bitmap_get_packed_row_size(mdjvu_bitmap_t b)
{
    return ROW_SIZE;
}

MDJVU_IMPLEMENT unsigned char *
    mdjvu_bitmap_access_packed_row(mdjvu_bitmap_t b, int32 i)
{
    return BMP->data[i];
}

MDJVU_IMPLEMENT void mdjvu_bitmap_clear(mdjvu_bitmap_t b)
{
    memset(BMP->data[0], 0, BMP->height * ROW_SIZE);
}

/* __________________________   packing/unpacking   ________________________ */

/* All the functions in this part are, well, suboptimized. */

MDJVU_IMPLEMENT void mdjvu_bitmap_pack_row
    (mdjvu_bitmap_t b, unsigned char *bytes, int32 y)
{
    unsigned char *bits = BMP->data[y];
    int coef = 0x80;
    int a = 0; /* accumulates bits */
    int32 i = BMP->width;
    while (i--)
    {
        if (*bytes++) a |= coef;

        coef >>= 1;
        if (!coef)
        {
            coef = 0x80;
            *bits++ = a;
            a = 0;
        }
    }

    if (BMP->width & 7) *bits = a;
}

MDJVU_IMPLEMENT void mdjvu_bitmap_unpack_row
    (mdjvu_bitmap_t b, unsigned char *bytes, int32 y)
{
    unsigned char *bits = BMP->data[y];
    int coef = 0x80;
    int a = *bits;
    int32 i = BMP->width;
    while (i--)
    {
        *bytes++ = a & coef;

        coef >>= 1;
        if (!coef)
        {
            coef = 0x80;
            if (!i) break; /* FIXME: this is not necessary, only to valgrind */
            a = *++bits;
        }
    }
}

/* FIXME: this is almost a copy of the previous function */
MDJVU_IMPLEMENT void mdjvu_bitmap_unpack_row_0_or_1
    (mdjvu_bitmap_t b, unsigned char *bytes, int32 y)
{
    unsigned char *bits = BMP->data[y];
    int coef = 0x80;
    int a = *bits;
    int32 i = BMP->width;
    while (i--)
    {
        *bytes++ = a & coef ? 1 : 0;

        coef >>= 1;
        if (!coef)
        {
            coef = 0x80;
            if (!i) break; /* FIXME: this is not necessary, only to valgrind */
            a = *++bits;
        }
    }
}

MDJVU_IMPLEMENT void mdjvu_bitmap_pack_all
    (mdjvu_bitmap_t b, unsigned char **data)
{
    int32 i = 0, h = BMP->height;
    for (i = 0; i < h; i++)
    {
        mdjvu_bitmap_pack_row(b, data[i], i);
    }
}

MDJVU_IMPLEMENT void mdjvu_bitmap_unpack_all
    (mdjvu_bitmap_t b, unsigned char **data)
{
    int32 i = 0, h = BMP->height;
    for (i = 0; i < h; i++)
    {
        mdjvu_bitmap_unpack_row(b, data[i], i);
    }
}

MDJVU_IMPLEMENT void mdjvu_bitmap_unpack_all_0_or_1
    (mdjvu_bitmap_t b, unsigned char **data)
{
    int32 i = 0, h = BMP->height;
    for (i = 0; i < h; i++)
    {
        mdjvu_bitmap_unpack_row_0_or_1(b, data[i], i);
    }
}

/* _______________________________   crop   ________________________________ */

MDJVU_IMPLEMENT mdjvu_bitmap_t mdjvu_bitmap_crop
    (mdjvu_bitmap_t b, int32 left, int32 top, int32 w, int32 h)
{
    if (left == 0 && top == 0 && w == BMP->width && h == BMP->height)
    {
        return mdjvu_bitmap_clone(b);
    }
    else
    {
        mdjvu_bitmap_t result;
        int32 i = top, count = h;
        unsigned char *buf;

        assert(left >= 0);
        assert(left + w <= BMP->width);
        assert(top >= 0);
        assert(top + h <= BMP->height);

        result = mdjvu_bitmap_create(w, h);
        buf = (unsigned char *) malloc(BMP->width);
        while (count--)
        {
            mdjvu_bitmap_unpack_row(b, buf, i);
            mdjvu_bitmap_pack_row(result, buf + left, i - top);
            i++;
        }
        free(buf);
        return result;
    }
}

/* _______________________________   bbox   ________________________________ */

static int row_is_empty(Bitmap *bmp, int32 y)
{
    unsigned char *row = bmp->data[y];
    int32 bytes_to_check = BYTES_PER_ROW(bmp->width) - 1;
    int32 bits_to_check = bmp->width - (bytes_to_check << 3);
    int32 mask = 0xFF << (8 - bits_to_check);
    int32 i;

    for (i = 0; i < bytes_to_check; i++)
        if (row[i]) return 0;

    if (row[bytes_to_check] & mask) return 0;
    return 1;
}

static int column_is_empty(Bitmap *bmp, int32 x)
{
    int32 byte_offset = x >> 3;
    int mask = 1 << (7 - (x & 7));
    int32 bytes_per_row = BYTES_PER_ROW(bmp->width);
    unsigned char *p = bmp->data[0] + byte_offset;
    int32 i = bmp->height;

    while(i--)
    {
        if (*p & mask) return 0;
        p += bytes_per_row;
    }

    return 1;
}

MDJVU_IMPLEMENT void mdjvu_bitmap_get_bounding_box(mdjvu_bitmap_t b,
    int32 *pl, int32 *pt, int32 *pw, int32 *ph)
{
    int32 right = BMP->width - 1;
    int32 left = 0;
    int32 bottom = BMP->height - 1;
    int32 top = 0;

    while (column_is_empty(BMP, right) && right) right--;
    while (column_is_empty(BMP, left) && left < right) left++;

    *pl = left;
    *pw = right - left + 1;

    while (row_is_empty(BMP, bottom) && bottom) bottom--;
    while (row_is_empty(BMP, top) && top < bottom) top++;

    *pt = top;
    *ph = bottom - top + 1;
}

MDJVU_IMPLEMENT void mdjvu_bitmap_remove_margins
    (mdjvu_bitmap_t b, int32 *px, int32 *py)
{
    int32 w, h;
    mdjvu_bitmap_t cropped;
    mdjvu_bitmap_get_bounding_box(b, px, py, &w, &h);
    if (!*px && !*py && w == BMP->width && h == BMP->height)
        return;
    cropped = mdjvu_bitmap_crop(b, *px, *py, w, h);
    mdjvu_bitmap_exchange(b, cropped);
    mdjvu_bitmap_destroy(cropped);
}

/* _______________________________   misc   ________________________________ */

/* This is a sub-optimal way to count mass.
 * Run "fortune -m BITCOUNT" to see a better way...
 */
MDJVU_IMPLEMENT int32 mdjvu_bitmap_get_mass(mdjvu_bitmap_t b)
{
    int32 m = 0;
    int32 w = BMP->width;
    int32 h = BMP->height;
    unsigned char *buf = (unsigned char *) malloc(w);
    int32 y;
    for (y = 0; y < h; y++)
    {
        int x;
        mdjvu_bitmap_unpack_row_0_or_1(b, buf, y);
        for (x = 0; x < w; x++)
            m += buf[x];
    }
    free(buf);
    return m;
}

