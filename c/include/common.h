#pragma once

#include <math.h>
#include <stddef.h>
#include <stdint.h>
#define PX_SIZE ((size_t)4)

static inline uint8_t clamp_to_u8(uint32_t val) {
  return val > 255 ? 255 : (uint8_t)val;
}

static inline uint8_t clamp_to_u8_int(int val) {
  return val < 0 ? 0 : (val > 255 ? 255 : (uint8_t)val);
}

static inline uint8_t clamp_to_u8_float(float val) {
  float rounded = rintf(val);

  if (rounded < 0.0f)
    return 0;
  if (rounded > 255.0f)
    return 255;

  return (uint8_t)rounded;
}

static inline size_t get_pixel_index(int x, int y, size_t width,
                                     size_t height) {
  size_t clamped_x = x < 0 ? 0 : (size_t)x;
  clamped_x = clamped_x >= width ? width - 1 : clamped_x;

  size_t clamped_y = y < 0 ? 0 : (size_t)y;
  clamped_y = clamped_y >= height ? height - 1 : clamped_y;

  return (clamped_y * width + clamped_x) * PX_SIZE;
}
