#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>

static int cmp_uint8(const void *a, const void *b) {
  return (*(const uint8_t *)a) - (*(const uint8_t *)b);
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
    for (size_t x = 0; x < width; x++) {
      size_t count = 0;

      for (int ky = -radius; ky <= radius; ky++) {
        for (int kx = -radius; kx <= radius; kx++) {
          size_t idx = get_pixel_index((int)x + kx, (int)y + ky, width, height);

          r_arr[count] = pixels[idx];
          g_arr[count] = pixels[idx + 1];
          b_arr[count] = pixels[idx + 2];
          count++;
        }
      }

      qsort(r_arr, size, sizeof(uint8_t), cmp_uint8);
      qsort(g_arr, size, sizeof(uint8_t), cmp_uint8);
      qsort(b_arr, size, sizeof(uint8_t), cmp_uint8);

      size_t dest = (y * width + x) * PX_SIZE;

      output[dest] = r_arr[mid];
      output[dest + 1] = g_arr[mid];
      output[dest + 2] = b_arr[mid];
      output[dest + 3] = pixels[dest + 3];
    }
  }
}
