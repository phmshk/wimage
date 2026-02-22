#include <stddef.h>
#include <stdint.h>

void apply_sepia(uint8_t *pixels, size_t width, size_t height) {

  size_t length = width * height * PX_SIZE;

  for (size_t i = 0; i < length; i += PX_SIZE) {
    uint8_t r = pixels[i];
    uint8_t g = pixels[i + 1];
    uint8_t b = pixels[i + 2];

    uint32_t tr = (r * 402 + g * 787 + b * 193) >> 10;
    uint32_t tg = (r * 357 + g * 702 + b * 172) >> 10;
    uint32_t tb = (r * 278 + g * 547 + b * 134) >> 10;

    pixels[i] = tr > 255 ? 255 : (uint8_t)tr;
    pixels[i + 1] = tg > 255 ? 255 : (uint8_t)tg;
    pixels[i + 2] = tb > 255 ? 255 : (uint8_t)tb;
  }
}
