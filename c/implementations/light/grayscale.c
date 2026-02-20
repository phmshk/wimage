#include <stddef.h>
#include <stdint.h>

void apply_grayscale(uint8_t *pixels, size_t width, size_t height) {

  size_t final_length = width * height * PX_SIZE;
  for (size_t i = 0; i < final_length; i += PX_SIZE) {
    uint8_t r = pixels[i];
    uint8_t g = pixels[i + 1];
    uint8_t b = pixels[i + 2];

    uint8_t gray = clamp_u8_float(0.299f * r + 0.587f * g + 0.114f * b);

    pixels[i] = gray;
    pixels[i + 1] = gray;
    pixels[i + 2] = gray;
  }
}
