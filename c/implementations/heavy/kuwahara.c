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
                                      int x2, int y2, int width, int height) {
  uint32_t r_sum = 0, g_sum = 0, b_sum = 0;
  uint32_t r_sq_sum = 0, g_sq_sum = 0, b_sq_sum = 0;
  uint32_t count = 0;

  for (int y = y1; y <= y2; y++) {
    int py = y;
    if (py < 0)
      py = 0;
    else if (py >= height)
      py = height - 1;
    size_t row_base = (size_t)py * width;

    for (int x = x1; x <= x2; x++) {
      int px = x;
      if (px < 0)
        px = 0;
      else if (px >= width)
        px = width - 1;

      size_t idx = (row_base + px) * PX_SIZE;

      uint32_t r = pixels[idx];
      uint32_t g = pixels[idx + 1];
      uint32_t b = pixels[idx + 2];

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
  float r_mean = (float)r_sum / f_count;
  float g_mean = (float)g_sum / f_count;
  float b_mean = (float)b_sum / f_count;

  float variance = ((float)r_sq_sum / f_count - r_mean * r_mean) +
                   ((float)g_sq_sum / f_count - g_mean * g_mean) +
                   ((float)b_sq_sum / f_count - b_mean * b_mean);

  RegionStats_t stats = {variance, r_mean, g_mean, b_mean};
  return stats;
}

void apply_kuwahara(uint8_t *pixels, uint8_t *output, size_t width,
                    size_t height, uint8_t radius) {
  if (radius < 1)
    return;

  int w = (int)width;
  int h = (int)height;
  int r = (int)radius;

  for (size_t y = 0; y < height; y++) {
    size_t row_base = y * width;
    for (size_t x = 0; x < width; x++) {

      int ix = (int)x;
      int iy = (int)y;

      RegionStats_t q1 = get_stats(pixels, ix - r, iy - r, ix, iy, w, h);
      RegionStats_t q2 = get_stats(pixels, ix, iy - r, ix + r, iy, w, h);
      RegionStats_t q3 = get_stats(pixels, ix - r, iy, ix, iy + r, w, h);
      RegionStats_t q4 = get_stats(pixels, ix, iy, ix + r, iy + r, w, h);

      float min_var = q1.variance;
      RegionStats_t best = q1;

      if (q2.variance < min_var) {
        min_var = q2.variance;
        best = q2;
      }
      if (q3.variance < min_var) {
        min_var = q3.variance;
        best = q3;
      }
      if (q4.variance < min_var) {
        best = q4;
      }

      size_t dest = (row_base + x) * PX_SIZE;

      output[dest] = clamp_to_u8_float(best.r);
      output[dest + 1] = clamp_to_u8_float(best.g);
      output[dest + 2] = clamp_to_u8_float(best.b);
      output[dest + 3] = pixels[dest + 3];
    }
  }
}
