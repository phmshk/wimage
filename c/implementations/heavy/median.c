#include <stddef.h>
#include <stdint.h>

static inline uint8_t find_median(uint8_t *arr, size_t size, size_t mid) {
  int counts[256] = {0};

  for (size_t i = 0; i < size; i++) {
    counts[arr[i]]++;
  }

  size_t sum = 0;
  for (int i = 0; i < 256; i++) {
    sum += counts[i];
    if (sum > mid) {
      return (uint8_t)i;
    }
  }
  return 0;
}

void apply_median(uint8_t *pixels, uint8_t *output, uint8_t *tmp_ptr,
                  size_t width, size_t height, uint8_t radius) {

  if (radius < 1)
    return;

  int side = 2 * radius + 1;
  size_t size = (size_t)(side * side);

  size_t mid = size / 2;

  uint8_t *r_arr = tmp_ptr;
  uint8_t *g_arr = tmp_ptr + size;
  uint8_t *b_arr = tmp_ptr + (size * 2);

  for (size_t y = 0; y < height; y++) {
    size_t row_base = y * width;

    for (size_t x = 0; x < width; x++) {
      size_t count = 0;

      for (int ky = -(int)radius; ky <= (int)radius; ky++) {
        int py = (int)y + ky;
        if (py < 0)
          py = 0;
        else if (py >= (int)height)
          py = (int)height - 1;
        size_t p_row_base = (size_t)py * width;

        for (int kx = -(int)radius; kx <= (int)radius; kx++) {
          int px = (int)x + kx;
          if (px < 0)
            px = 0;
          else if (px >= (int)width)
            px = (int)width - 1;

          size_t idx = (p_row_base + (size_t)px) * PX_SIZE;

          r_arr[count] = pixels[idx];
          g_arr[count] = pixels[idx + 1];
          b_arr[count] = pixels[idx + 2];
          count++;
        }
      }

      size_t dest = (row_base + x) * PX_SIZE;

      output[dest] = find_median(r_arr, size, mid);
      output[dest + 1] = find_median(g_arr, size, mid);
      output[dest + 2] = find_median(b_arr, size, mid);
      output[dest + 3] = pixels[dest + 3];
    }
  }
}
