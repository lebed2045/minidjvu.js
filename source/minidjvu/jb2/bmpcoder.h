/*
 * bmpcoder.h - encoding/decoding bitmaps (DjVu 2 specification, 8.5.9-10)
 */

#ifndef MDJVU_BMPCODER_H
#define MDJVU_BMPCODER_H

#include "jb2const.h"
#include "zp.h"

class JB2BitmapDecoder
{
    public:
        mdjvu_bitmap_t decode(mdjvu_image_t,
                              mdjvu_bitmap_t prototype = NULL);
        JB2BitmapDecoder(ZPDecoder &, ZPMemoryWatcher *w = NULL);
        void reset_numcontexts(); // this was introduced in DjVu 3
    protected:
        ZPDecoder &zp;
        // JB3BitmapDecoder jb3; /* XXX */
        int code_pixel(ZPBitContext &, unsigned char *pixel, int erosion);
        void load_row(mdjvu_bitmap_t, int32 y, unsigned char *row);
        void save_row(mdjvu_bitmap_t, int32 y, unsigned char *row, int erosion);
        ZPBitContext bitmap_direct[1024];
        ZPBitContext bitmap_refine[2048];
        ZPNumContext
            symbol_width,
            symbol_height,
            symbol_width_difference,
            symbol_height_difference;
        JB2BitmapDecoder(ZPMemoryWatcher *w = NULL);

        ~JB2BitmapDecoder() {}

        void code_row_directly(int32 n, unsigned char *up2,
                                        unsigned char *up1,
                                        unsigned char *target,
                                        unsigned char *erosion);
        void code_row_by_refinement(int32 n,
                                    unsigned char *up1,
                                    unsigned char *target,
                                    unsigned char *p_up,
                                    unsigned char *p_sm,
                                    unsigned char *p_dn,
                                    unsigned char *erosion);
        void code_image_directly(mdjvu_bitmap_t, mdjvu_bitmap_t erosion_mask);
        void code_image_by_refinement(mdjvu_bitmap_t, mdjvu_bitmap_t prototype, mdjvu_bitmap_t erosion_mask);
};

class JB2BitmapEncoder
{
    public:
        void encode(mdjvu_bitmap_t, mdjvu_bitmap_t prototype = NULL, mdjvu_bitmap_t erosion_mask = NULL);
        JB2BitmapEncoder(ZPEncoder &, ZPMemoryWatcher *w = NULL);
        void reset_numcontexts(); // this was introduced in DjVu 3
    protected:
        ZPEncoder &zp;
        // JB3BitmapEncoder jb3; /* XXX */
        virtual int code_pixel(ZPBitContext &, unsigned char *pixel, int erosion);
        virtual void load_row(mdjvu_bitmap_t, int32 y, unsigned char *row);
        virtual void save_row(mdjvu_bitmap_t, int32 y, unsigned char *row, int erosion);
        ZPBitContext bitmap_direct[1024];
        ZPBitContext bitmap_refine[2048];
        ZPNumContext
            symbol_width,
            symbol_height,
            symbol_width_difference,
            symbol_height_difference;
        JB2BitmapEncoder(ZPMemoryWatcher *w = NULL);

        virtual ~JB2BitmapEncoder() {}

        void code_row_directly(int32 n, unsigned char *up2,
                                        unsigned char *up1,
                                        unsigned char *target,
                                        unsigned char *erosion);
        void code_row_by_refinement(int32 n,
                                    unsigned char *up1,
                                    unsigned char *target,
                                    unsigned char *p_up,
                                    unsigned char *p_sm,
                                    unsigned char *p_dn,
                                    unsigned char *erosion);
        void code_image_directly(mdjvu_bitmap_t, mdjvu_bitmap_t erosion_mask);
        void code_image_by_refinement(mdjvu_bitmap_t, mdjvu_bitmap_t prototype, mdjvu_bitmap_t erosion_mask);

};

#endif
