#include <stddef.h>
#include <stdint.h>

void apply_inversion(uint8_t *pixels, size_t width, size_t height) {

  size_t pixel_count = width * height * PX_SIZE;

  for (size_t i = 0; i < pixel_count; i += PX_SIZE) {
    pixels[i] = 255 - pixels[i];
    pixels[i + 1] = 255 - pixels[i + 1];
    pixels[i + 2] = 255 - pixels[i + 2];
  }
}
