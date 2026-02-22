#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>

void apply_sobel(uint8_t *pixels, uint8_t *output, size_t width,
                 size_t height) {
  size_t total_bytes = width * height * PX_SIZE;
  for (size_t i = 0; i < total_bytes; i += PX_SIZE) {
    output[i] = 0;
    output[i + 1] = 0;
    output[i + 2] = 0;
    output[i + 3] = 255;
  }

  int row_bytes = width * PX_SIZE;

  for (size_t y = 1; y < height - 1; y++) {
    size_t idx = (y * width + 1) * PX_SIZE;
    for (size_t x = 1; x < width - 1; x++, idx += PX_SIZE) {

      for (int c = 0; c < 3; c++) {
        int tl = pixels[idx - row_bytes - PX_SIZE + c];
        int tc = pixels[idx - row_bytes + c];
        int tr = pixels[idx - row_bytes + PX_SIZE + c];
        int l = pixels[idx - PX_SIZE + c];
        int r = pixels[idx + PX_SIZE + c];
        int bl = pixels[idx + row_bytes - PX_SIZE + c];
        int bc = pixels[idx + row_bytes + c];
        int br = pixels[idx + row_bytes + PX_SIZE + c];

        int gx = -tl + tr - (l << 1) + (r << 1) - bl + br;
        int gy = -tl - (tc << 1) - tr + bl + (bc << 1) + br;

        // magnitude: |gx| + |gy|
        int gx_abs = gx < 0 ? -gx : gx;
        int gy_abs = gy < 0 ? -gy : gy;
        int mag = gx_abs + gy_abs;

        output[idx + c] = clamp_to_u8_int(mag);
      }
    }
  }
}
