#include <emscripten.h>
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>

#include "include/common.h"
#include "include/filters.h"

// --- Light ---
#include "implementations/light/grayscale.c"
#include "implementations/light/inversion.c"
#include "implementations/light/sepia.c"

// --- Medium ---
#include "implementations/medium/gaussian.c"
#include "implementations/medium/sharpen.c"
#include "implementations/medium/sobel.c"

// --- Heavy ---
#include "implementations/heavy/bilateral.c"
#include "implementations/heavy/kuwahara.c"
#include "implementations/heavy/median.c"
