#include <math.h>
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>
void apply_gaussian_blur(uint8_t *pixels, float *kernel, uint8_t *tmp_pixels,
                         uint8_t *final_pixels, size_t width, size_t height,
                         uint8_t radius) {

  if (radius < 1)
    return;
  // kernel generation (1D)
  float sigma = (float)radius / 3.0f;
  size_t kernel_size = 2 * (size_t)radius + 1;

  float kernel_sum = 0.0f;

  const float two_sigma_sq = 2.0f * sigma * sigma;
  const float multiplier = 1.0f / (sqrtf(2.0f * (float)M_PI) * sigma);

  // fill with gaussian
  for (size_t i = 0; i < kernel_size; i++) {
    int x = (int)i - (int)radius;
    float g = multiplier * expf(-((float)(x * x)) / two_sigma_sq);
    kernel[i] = g;
    kernel_sum += g;
  }

  const float inv_kernel_sum = 1.0f / kernel_sum;
  for (size_t i = 0; i < kernel_size; i++) {
    kernel[i] *= inv_kernel_sum;
  }

  // 2. horizontal (Source -> Temp)
  for (size_t y = 0; y < height; y++) {
    for (size_t x = 0; x < width; x++) {
      float r = 0.0f;
      float g = 0.0f;
      float b = 0.0f;
      float a = 0.0f;

      for (size_t k = 0; k < kernel_size; k++) {
        int sample_x = (int)x + ((int)k - (int)radius);
        size_t offset = get_pixel_index(sample_x, (int)y, width, height);

        float weight = kernel[k];

        r += (float)(pixels[offset]) * weight;
        g += (float)(pixels[offset + 1]) * weight;
        b += (float)(pixels[offset + 2]) * weight;
        a += (float)(pixels[offset + 3]) * weight;
      }

      size_t dest_index = (y * width + x) * PX_SIZE;
      tmp_pixels[dest_index] = clamp_u8_float(r);
      tmp_pixels[dest_index + 1] = clamp_u8_float(g);
      tmp_pixels[dest_index + 2] = clamp_u8_float(b);
      tmp_pixels[dest_index + 3] = clamp_u8_float(a);
    }
  }

  // 3. vertical (Temp -> Final)
  for (size_t y = 0; y < height; y++) {
    for (size_t x = 0; x < width; x++) {
      float r = 0.0f;
      float g = 0.0f;
      float b = 0.0f;
      float a = 0.0f;

      for (size_t k = 0; k < kernel_size; k++) {
        int sample_y = (int)y + ((int)k - (int)radius);
        size_t offset = get_pixel_index((int)x, sample_y, width, height);
        float weight = kernel[k];

        r += (float)(tmp_pixels[offset]) * weight;
        g += (float)(tmp_pixels[offset + 1]) * weight;
        b += (float)(tmp_pixels[offset + 2]) * weight;
        a += (float)(tmp_pixels[offset + 3]) * weight;
      }

      size_t dest_index = (y * width + x) * PX_SIZE;
      final_pixels[dest_index] = clamp_u8_float(r);
      final_pixels[dest_index + 1] = clamp_u8_float(g);
      final_pixels[dest_index + 2] = clamp_u8_float(b);
      final_pixels[dest_index + 3] = clamp_u8_float(a);
    }
  }
}
