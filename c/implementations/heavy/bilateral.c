#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>

void apply_bilateral(uint8_t *pixels, uint8_t *output, size_t width,
                     size_t height, uint8_t radius) {

  if (radius < 1)
    return;

  float sigma_s = (float)radius / 2.0f;
  float sigma_r = 30.0f;

  const float gauss_s_coeff = 1.0f / (2.0f * sigma_s * sigma_s);
  const float gauss_r_coeff = 1.0f / (2.0f * sigma_r * sigma_r);

  for (size_t y = 0; y < height; y++) {
    for (size_t x = 0; x < width; x++) {

      size_t center_idx = get_pixel_index((int)x, (int)y, width, height);
      int r0 = pixels[center_idx];
      int g0 = pixels[center_idx + 1];
      int b0 = pixels[center_idx + 2];

      float sum_r = 0.0f;
      float sum_g = 0.0f;
      float sum_b = 0.0f;
      float sum_weight = 0.0f;

      for (int ky = -radius; ky <= radius; ky++) {
        for (int kx = -radius; kx <= radius; kx++) {

          size_t idx = get_pixel_index((int)x + kx, (int)y + ky, width, height);

          int r = pixels[idx];
          int g = pixels[idx + 1];
          int b = pixels[idx + 2];

          float dist_sq = (float)(kx * kx + ky * ky);

          int dr = r - r0;
          int dg = g - g0;
          int db = b - b0;
          float diff_sq = (float)(dr * dr + dg * dg + db * db);

          float weight =
              expf(-dist_sq * gauss_s_coeff - diff_sq * gauss_r_coeff);

          sum_r += (float)r * weight;
          sum_g += (float)g * weight;
          sum_b += (float)b * weight;
          sum_weight += weight;
        }
      }

      size_t dest = (y * width + x) * PX_SIZE;

      output[dest] = clamp_u8_float(sum_r / sum_weight);
      output[dest + 1] = clamp_u8_float(sum_g / sum_weight);
      output[dest + 2] = clamp_u8_float(sum_b / sum_weight);
      output[dest + 3] = pixels[dest + 3];
    }
  }
}
