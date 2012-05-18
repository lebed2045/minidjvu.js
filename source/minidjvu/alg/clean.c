/*
 * clean.c - removing small flyspecks
 */

#include "mdjvucfg.h"
#include "minidjvu.h"
#include <stdlib.h>

/*
 * This implementation is very simple.
 * Most likely halftone patterns will get deleted...
 */

MDJVU_IMPLEMENT void mdjvu_clean(mdjvu_image_t image)
{
    int32 b = mdjvu_image_get_blit_count(image), i;
    int32 dpi = mdjvu_image_get_resolution(image);
    int32 tinysize = dpi*dpi/20000 - 1;
    mdjvu_image_enable_masses(image);
    if (tinysize <= 0) return;

    for (i = 0; i < b; i++)
    {
        mdjvu_bitmap_t bitmap = mdjvu_image_get_blit_bitmap(image, i);
        int32 mass = mdjvu_image_get_mass(image, bitmap);
        if (mass <= tinysize)
            mdjvu_image_set_blit_bitmap(image, i, NULL);
    }

    mdjvu_image_remove_NULL_blits(image);
    mdjvu_image_remove_unused_bitmaps(image);
}
