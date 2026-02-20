# Image name for the Docker container
EM_IMAGE = emscripten/emsdk:3.1.51

# Directory paths
SRC_DIR = c
# JS glue code goes to src to be imported by TypeScript
OUT_JS_DIR = src/shared/lib/wasm
# Wasm binary goes to public to be served statically
OUT_WASM_DIR = public/wasm

SRC_FILE = $(SRC_DIR)/main.c
# Temporary output path
TEMP_OUT = filters.js

# Compiler flags:
# -O3: Aggressive optimizations for speed
# -pthread: Enables SharedArrayBuffer and Atomics support
# -s WASM=1: Compile to WebAssembly
# -s MODULARIZE=1: Wrap the output in a module function (Promise-based)
# -s EXPORT_NAME="createWasmModule": The name of the exported function
# -s ENVIRONMENT="worker": Optimize for web worker environment
# -s ALLOW_MEMORY_GROWTH=1: Allow memory to expand if image is large
# -s EXPORTED_FUNCTIONS: List of C functions to export to JS
# -s EXPORTED_RUNTIME_METHODS: Helper functions for JS interop
CFLAGS = -O3 \
	-pthread \
	-s WASM=1 \
	-s MODULARIZE=1 \
	-s SHARED_MEMORY=1 \
	-s EXPORT_ES6=1 \
	-s USE_ES6_IMPORT_META=0 \
	-s EXPORT_NAME="createWasmModule" \
	-s ENVIRONMENT="worker" \
	-s ALLOW_MEMORY_GROWTH=1 \
	-s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' \
	-s EXPORTED_FUNCTIONS='[\
		"_apply_grayscale", \
		"_apply_inversion", \
		"_apply_sepia", \
		"_apply_gaussian_blur", \
		"_apply_sharpen", \
		"_apply_sobel", \
		"_apply_bilateral", \
		"_apply_kuwahara", \
		"_apply_median", \
		"_malloc", \
		"_free"\
	]'

# Main target to build the project
wasm:
	# Ensure directories exist
	mkdir -p $(OUT_JS_DIR)
	mkdir -p $(OUT_WASM_DIR)
	
	# Run Emscripten in Docker
	# We compile to a temporary file first, then move output files to their destinations
	docker run --rm -v $(PWD):/app -w /app $(EM_IMAGE) \
	emcc $(SRC_FILE) $(CFLAGS) -I$(SRC_DIR) -o $(TEMP_OUT)

	# Move the generated JS file to the source directory
	mv $(TEMP_OUT) $(OUT_JS_DIR)/filters.js
	
	# Move the generated Wasm file to the public directory
	mv filters.wasm $(OUT_WASM_DIR)/filters.wasm
	# mv filters.worker.js $(OUT_WASM_DIR)/filters.worker.js
# Clean up generated files
clean:
	rm -f $(OUT_JS_DIR)/filters.js
	rm -f $(OUT_WASM_DIR)/filters.wasm
	# rm -f $(OUT_WASM_DIR)/filters.worker.js
