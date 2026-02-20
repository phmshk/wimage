#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>

typedef struct {
  float variance;
  float r;
  float g;
  float b;
} RegionStats_t;

static inline RegionStats_t get_stats(const uint8_t *pixels, int x1, int y1,
                                      int x2, int y2, size_t width,
                                      size_t height) {
  float r_sum = 0.0f, g_sum = 0.0f, b_sum = 0.0f;
  float r_sq_sum = 0.0f, g_sq_sum = 0.0f, b_sq_sum = 0.0f;
  int count = 0;

  for (int y = y1; y <= y2; y++) {
    for (int x = x1; x <= x2; x++) {
      size_t idx = get_pixel_index(x, y, width, height);

      float r = (float)pixels[idx];
      float g = (float)pixels[idx + 1];
      float b = (float)pixels[idx + 2];

      r_sum += r;
      g_sum += g;
      b_sum += b;
      r_sq_sum += r * r;
      g_sq_sum += g * g;
      b_sq_sum += b * b;
      count++;
    }
  }

  float f_count = (float)count;

  float r_mean = r_sum / f_count;
  float g_mean = g_sum / f_count;
  float b_mean = b_sum / f_count;

  float variance = (r_sq_sum / f_count - r_mean * r_mean) +
                   (g_sq_sum / f_count - g_mean * g_mean) +
                   (b_sq_sum / f_count - b_mean * b_mean);

  RegionStats_t stats = {variance, r_mean, g_mean, b_mean};
  return stats;
}

void apply_kuwahara(uint8_t *pixels, uint8_t *output, size_t width,
                    size_t height, uint8_t radius) {
  if (radius < 1)
    return;

  for (size_t y = 0; y < height; y++) {
    for (size_t x = 0; x < width; x++) {

      int ix = (int)x;
      int iy = (int)y;

      RegionStats_t q1 =
          get_stats(pixels, ix - radius, iy - radius, ix, iy, width, height);
      RegionStats_t q2 =
          get_stats(pixels, ix, iy - radius, ix + radius, iy, width, height);
      RegionStats_t q3 =
          get_stats(pixels, ix - radius, iy, ix, iy + radius, width, height);
      RegionStats_t q4 =
          get_stats(pixels, ix, iy, ix + radius, iy + radius, width, height);

      float min_var = q1.variance;
      RegionStats_t best_region = q1;

      if (q2.variance < min_var) {
        min_var = q2.variance;
        best_region = q2;
      }
      if (q3.variance < min_var) {
        min_var = q3.variance;
        best_region = q3;
      }
      if (q4.variance < min_var) {
        min_var = q4.variance;
        best_region = q4;
      }

      size_t dest = (y * width + x) * PX_SIZE;

      output[dest] = clamp_u8_float(best_region.r);
      output[dest + 1] = clamp_u8_float(best_region.g);
      output[dest + 2] = clamp_u8_float(best_region.b);
      output[dest + 3] = pixels[dest + 3];
    }
  }
}
