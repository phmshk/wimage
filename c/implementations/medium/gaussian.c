#include <math.h>
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>

static int gaussian_cached_radius = -1;

void apply_gaussian_blur(uint8_t *pixels, uint32_t *kernel, uint8_t *tmp_pixels,
                         uint8_t *final_pixels, size_t width, size_t height,
                         uint8_t radius) {

  if (radius < 1)
    return;
  size_t kernel_size = 2 * (size_t)radius + 1;

  if (radius != gaussian_cached_radius) {
    // kernel generation (1D)
    float sigma = (float)radius / 3.0f;
    const float two_sigma_sq = 2.0f * sigma * sigma;
    float kernel_sum = 0.0f;
    float float_kernel[256];

    // fill with gaussian
    for (size_t i = 0; i < kernel_size; i++) {
      int x = (int)i - (int)radius;
      float g = expf(-((float)(x * x)) / two_sigma_sq);
      float_kernel[i] = g;
      kernel_sum += g;
    }

    // normalization and transfer to fixed point
    for (size_t i = 0; i < kernel_size; i++) {
      kernel[i] = (uint32_t)roundf((float_kernel[i] / kernel_sum) * 65536.0f);
    }
    gaussian_cached_radius = radius;
  }

  // 2. horizontal (Source -> Temp)
  for (size_t y = 0; y < height; y++) {
    size_t row_base = y * width;
    for (size_t x = 0; x < width; x++) {
      uint32_t r = 0, g = 0, b = 0, a = 0;

      for (size_t k = 0; k < kernel_size; k++) {
        // Inline clamp по X
        int px = (int)x + (int)k - (int)radius;
        if (px < 0)
          px = 0;
        else if (px >= (int)width)
          px = (int)width - 1;

        size_t offset = (row_base + (size_t)px) * PX_SIZE;
        uint32_t weight = kernel[k];

        r += pixels[offset] * weight;
        g += pixels[offset + 1] * weight;
        b += pixels[offset + 2] * weight;
        a += pixels[offset + 3] * weight;
      }

      size_t dest = (row_base + x) * PX_SIZE;
      tmp_pixels[dest] = clamp_to_u8(r >> 16);
      tmp_pixels[dest + 1] = clamp_to_u8(g >> 16);
      tmp_pixels[dest + 2] = clamp_to_u8(b >> 16);
      tmp_pixels[dest + 3] = clamp_to_u8(a >> 16);
    }
  }

  // 3. vertical (Temp -> Final)
  for (size_t y = 0; y < height; y++) {
    size_t row_base = y * width;
    for (size_t x = 0; x < width; x++) {
      uint32_t r = 0, g = 0, b = 0, a = 0;

      for (size_t k = 0; k < kernel_size; k++) {
        // Inline clamp по Y
        int py = (int)y + (int)k - (int)radius;
        if (py < 0)
          py = 0;
        else if (py >= (int)height)
          py = (int)height - 1;

        size_t offset = ((size_t)py * width + x) * PX_SIZE;
        uint32_t weight = kernel[k];

        r += tmp_pixels[offset] * weight;
        g += tmp_pixels[offset + 1] * weight;
        b += tmp_pixels[offset + 2] * weight;
        a += tmp_pixels[offset + 3] * weight;
      }

      size_t dest = (row_base + x) * PX_SIZE;
      final_pixels[dest] = clamp_to_u8(r >> 16);
      final_pixels[dest + 1] = clamp_to_u8(g >> 16);
      final_pixels[dest + 2] = clamp_to_u8(b >> 16);
      final_pixels[dest + 3] = clamp_to_u8(a >> 16);
    }
  }
}
