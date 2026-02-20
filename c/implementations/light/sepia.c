#include <stddef.h>
#include <stdint.h>

void apply_sepia(uint8_t *pixels, size_t width, size_t height) {

  size_t length = width * height * PX_SIZE;

  for (size_t i = 0; i < length; i += PX_SIZE) {
    uint8_t r = pixels[i];
    uint8_t g = pixels[i + 1];
    uint8_t b = pixels[i + 2];

    pixels[i] = clamp_u8_float(r * 0.393f + g * 0.769f + b * 0.189f);
    pixels[i + 1] = clamp_u8_float(r * 0.349f + g * 0.686f + b * 0.168f);
    pixels[i + 2] = clamp_u8_float(r * 0.272f + g * 0.534f + b * 0.131f);
  }
}
