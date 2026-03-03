#pragma once

#include <stddef.h>
#include <stdint.h>

#ifndef EXPORT_WASM
#define EXPORT_WASM __attribute__((used)) __attribute__((visibility("default")))
#endif

// light
EXPORT_WASM void apply_grayscale(uint8_t *pixels, size_t width, size_t height);
EXPORT_WASM void apply_inversion(uint8_t *pixels, size_t width, size_t height);
EXPORT_WASM void apply_sepia(uint8_t *pixels, size_t width, size_t height);

// medium
EXPORT_WASM void apply_gaussian_blur(uint8_t *pixels, uint32_t *kernel,
                                     uint8_t *tmp_pixels, uint8_t *final_pixels,
                                     size_t width, size_t height,
                                     uint8_t radius);
EXPORT_WASM void apply_sharpen(uint8_t *pixels, uint8_t *output, size_t width,
                               size_t height);
EXPORT_WASM void apply_sobel(uint8_t *pixels, uint8_t *output, size_t width,
                             size_t height);

// heavy
EXPORT_WASM void apply_bilateral(uint8_t *pixels, uint8_t *output, int width,
                                 int height, int radius);
EXPORT_WASM void apply_kuwahara(uint8_t *pixels, uint8_t *output, size_t width,
                                size_t height, uint8_t radius);
EXPORT_WASM void apply_median(uint8_t *pixels, uint8_t *output,
                              uint8_t *temp_ptr, size_t width, size_t height,
                              uint8_t radius);
