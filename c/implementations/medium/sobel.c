#include <math.h>
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>

void apply_sobel(uint8_t *pixels, uint8_t *output, size_t width,
                 size_t height) {
  const int kernel_x[] = {-1, 0, 1, -2, 0, 2, -1, 0, 1};
  const int kernel_y[] = {-1, -2, -1, 0, 0, 0, 1, 2, 1};

  for (size_t y = 0; y < height; y++) {
    for (size_t x = 0; x < width; x++) {

      int rx = 0;
      int gx = 0;
      int bx = 0;

      int ry = 0;
      int gy = 0;
      int by = 0;

      for (size_t ky = 0; ky < 3; ky++) {
        for (size_t kx = 0; kx < 3; kx++) {
          int sample_x = (int)x + (int)kx - 1;
          int sample_y = (int)y + (int)ky - 1;

          size_t idx = get_pixel_index(sample_x, sample_y, width, height);

          int weight_x = kernel_x[ky * 3 + kx];
          int weight_y = kernel_y[ky * 3 + kx];

          rx += pixels[idx] * weight_x;
          gx += pixels[idx + 1] * weight_x;
          bx += pixels[idx + 2] * weight_x;

          ry += pixels[idx] * weight_y;
          gy += pixels[idx + 1] * weight_y;
          by += pixels[idx + 2] * weight_y;
        }
      }
      size_t dest = (y * width + x) * PX_SIZE;

      output[dest] = clamp_u8_float(sqrtf((float)(rx * rx + ry * ry)));
      output[dest + 1] = clamp_u8_float(sqrtf((float)(gx * gx + gy * gy)));
      output[dest + 2] = clamp_u8_float(sqrtf((float)(bx * bx + by * by)));
      output[dest + 3] = 255;
    }
  }
}
