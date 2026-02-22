#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>

void apply_sharpen(uint8_t *pixels, uint8_t *output, size_t width,
                   size_t height) {
  size_t total_bytes = width * height * PX_SIZE;
  for (size_t i = 0; i < total_bytes; i++) {
    output[i] = pixels[i];
  }

  int row_bytes = width * PX_SIZE;
  for (size_t y = 1; y < height - 1; y++) {
    size_t idx = (y * width + 1) * PX_SIZE;

    for (size_t x = 1; x < width - 1; x++, idx += PX_SIZE) {

      // c = 0 (Red), 1 (Green), 2 (Blue)
      for (int c = 0; c < 3; c++) {
        // kernel
        int sum = pixels[idx - row_bytes + c] * -1 + // top
                  pixels[idx - PX_SIZE + c] * -1 +   // left
                  pixels[idx + c] * 5 +              // center
                  pixels[idx + PX_SIZE + c] * -1 +   // right
                  pixels[idx + row_bytes + c] * -1;  // bottom

        output[idx + c] = clamp_to_u8_int(sum);
      }
    }
  }
}
