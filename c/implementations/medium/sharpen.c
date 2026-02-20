#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>

void apply_sharpen(uint8_t *pixels, uint8_t *output, size_t width,
                   size_t height) {
  const int kernel[] = {0, -1, 0, -1, 5, -1, 0, -1, 0};

  for (size_t y = 0; y < height; y++) {
    for (size_t x = 0; x < width; x++) {
      int r = 0;
      int g = 0;
      int b = 0;

      for (size_t ky = 0; ky < 3; ky++) {
        for (size_t kx = 0; kx < 3; kx++) {
          int sample_x = (int)x + (int)kx - 1;
          int sample_y = (int)y + (int)ky - 1;
          size_t idx = get_pixel_index(sample_x, sample_y, width, height);
          int weight = kernel[ky * 3 + kx];

          r += pixels[idx] * weight;
          g += pixels[idx + 1] * weight;
          b += pixels[idx + 2] * weight;
        }
      }
      size_t dest = (y * width + x) * PX_SIZE;
      output[dest] = clamp_u8_int(r);
      output[dest + 1] = clamp_u8_int(g);
      output[dest + 2] = clamp_u8_int(b);
      output[dest + 3] = pixels[dest + 3];
    }
  }
}
