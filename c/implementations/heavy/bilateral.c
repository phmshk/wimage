#include <stddef.h>
#include <stdint.h>

#define MAX_RADIUS 100
#define MAX_DIST_SQ (2 * MAX_RADIUS * MAX_RADIUS)
#define MAX_DIFF_SQ 195075 // 255*255*3

// static buffers
static float spatial_lut[MAX_DIST_SQ + 1];
static float range_lut[MAX_DIFF_SQ + 1];
static int bilateral_cached_radius = -1;

void apply_bilateral(uint8_t *pixels, uint8_t *output, int width, int height,
                     int radius) {

  if (radius < 1 || radius > MAX_RADIUS)
    return;

  if (radius != bilateral_cached_radius) {
    float sigma_s = (float)radius / 2.0f;
    float sigma_r = 30.0f;

    float gauss_s_coeff = 1.0f / (2.0f * sigma_s * sigma_s);
    float gauss_r_coeff = 1.0f / (2.0f * sigma_r * sigma_r);

    int current_max_dist_sq = 2 * radius * radius;
    for (int i = 0; i <= current_max_dist_sq; i++) {
      spatial_lut[i] = expf(-(float)i * gauss_s_coeff);
    }

    for (int i = 0; i <= MAX_DIFF_SQ; i++) {
      range_lut[i] = expf(-(float)i * gauss_r_coeff);
    }

    bilateral_cached_radius = radius;
  }

  for (int y = 0; y < height; y++) {
    int row_base = y * width;

    for (int x = 0; x < width; x++) {

      int center_idx = (row_base + x) << 2;

      int r0 = pixels[center_idx];
      int g0 = pixels[center_idx + 1];
      int b0 = pixels[center_idx + 2];

      float sum_r = 0.0f;
      float sum_g = 0.0f;
      float sum_b = 0.0f;
      float sum_weight = 0.0f;

      for (int ky = -radius; ky <= radius; ky++) {
        int py = y + ky;
        if (py < 0)
          py = 0;
        else if (py >= height)
          py = height - 1;

        int p_row_base = py * width;

        for (int kx = -radius; kx <= radius; kx++) {
          int px = x + kx;
          if (px < 0)
            px = 0;
          else if (px >= width)
            px = width - 1;

          int idx = (p_row_base + px) << 2;

          int r = pixels[idx];
          int g = pixels[idx + 1];
          int b = pixels[idx + 2];

          int dist_sq = kx * kx + ky * ky;

          int dr = r - r0;
          int dg = g - g0;
          int db = b - b0;
          int diff_sq = dr * dr + dg * dg + db * db;

          float weight = spatial_lut[dist_sq] * range_lut[diff_sq];

          sum_r += (float)r * weight;
          sum_g += (float)g * weight;
          sum_b += (float)b * weight;
          sum_weight += weight;
        }
      }

      output[center_idx] = clamp_to_u8_float(sum_r / sum_weight);
      output[center_idx + 1] = clamp_to_u8_float(sum_g / sum_weight);
      output[center_idx + 2] = clamp_to_u8_float(sum_b / sum_weight);
      output[center_idx + 3] = pixels[center_idx + 3]; // Копируем альфа-канал
    }
  }
}

// void apply_bilateral(uint8_t *pixels, uint8_t *output, size_t width,
//                      size_t height, uint8_t radius) {
//
//   if (radius < 1 || radius > MAX_RADIUS)
//     return;
//
//   if (radius != bilateral_cached_radius) {
//     float sigma_s = (float)radius / 2.0f;
//     float sigma_r = 30.0f;
//
//     float gauss_s_coeff = 1.0f / (2.0f * sigma_s * sigma_s);
//     float gauss_r_coeff = 1.0f / (2.0f * sigma_r * sigma_r);
//
//     // (Spatial LUT)
//     int current_max_dist_sq = 2 * radius * radius;
//     for (int i = 0; i <= current_max_dist_sq; i++) {
//       spatial_lut[i] = expf(-(float)i * gauss_s_coeff);
//     }
//
//     // (Range LUT)
//     for (int i = 0; i <= MAX_DIFF_SQ; i++) {
//       range_lut[i] = expf(-(float)i * gauss_r_coeff);
//     }
//
//     bilateral_cached_radius = radius;
//   }
//
//   for (size_t y = 0; y < height; y++) {
//     size_t row_base = y * width;
//
//     for (size_t x = 0; x < width; x++) {
//
//       size_t center_idx = (row_base + x) * PX_SIZE;
//       int r0 = pixels[center_idx];
//       int g0 = pixels[center_idx + 1];
//       int b0 = pixels[center_idx + 2];
//
//       float sum_r = 0.0f;
//       float sum_g = 0.0f;
//       float sum_b = 0.0f;
//       float sum_weight = 0.0f;
//
//       for (int ky = -radius; ky <= radius; ky++) {
//         // inline clamp by Y
//         int py = (int)y + ky;
//         if (py < 0)
//           py = 0;
//         else if (py >= (int)height)
//           py = (int)height - 1;
//         size_t p_row_base = (size_t)py * width;
//
//         for (int kx = -radius; kx <= radius; kx++) {
//           // inline clamp by X
//           int px = (int)x + kx;
//           if (px < 0)
//             px = 0;
//           else if (px >= (int)width)
//             px = (int)width - 1;
//
//           size_t idx = (p_row_base + (size_t)px) * PX_SIZE;
//
//           int r = pixels[idx];
//           int g = pixels[idx + 1];
//           int b = pixels[idx + 2];
//
//           int dist_sq = kx * kx + ky * ky;
//
//           int dr = r - r0;
//           int dg = g - g0;
//           int db = b - b0;
//           int diff_sq = dr * dr + dg * dg + db * db;
//
//           float weight = spatial_lut[dist_sq] * range_lut[diff_sq];
//
//           sum_r += (float)r * weight;
//           sum_g += (float)g * weight;
//           sum_b += (float)b * weight;
//           sum_weight += weight;
//         }
//       }
//
//       output[center_idx] = clamp_to_u8_float(sum_r / sum_weight);
//       output[center_idx + 1] = clamp_to_u8_float(sum_g / sum_weight);
//       output[center_idx + 2] = clamp_to_u8_float(sum_b / sum_weight);
//       output[center_idx + 3] = pixels[center_idx + 3];
//     }
//   }
// }
