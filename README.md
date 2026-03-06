# wimage: JS vs. WASM Image Processing Benchmark

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://phmshk.github.io/wimage/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**wimage** is a web application designed to compare the execution speed of image processing algorithms between pure JavaScript and WebAssembly (C). It serves as both a functional image editor and a technical demonstration of modern browser capabilities.

## Key Features

- **Hybrid Engine Architecture:** Switch seamlessly between JavaScript and WebAssembly (WASM) execution engines.
- **Non-Blocking UI:** All heavy computations are offloaded to **Web Workers** to ensure 60 FPS interface responsiveness even during complex filter applications.
- **Zero-Copy Data Transfer:** Utilizes **Transferable Objects** (`ArrayBuffer`) to minimize memory overhead and eliminate serialization delays when moving data between threads.
- **Comprehensive Benchmarking:** Dedicated benchmark suite with interactive charts (via Recharts) to visualize performance deltas across different image sizes and filter complexities.
- **Mobile-First Design:** Fully responsive interface built with Tailwind CSS and Shadcn UI.

## Technology Stack

- **Runtime & Package Manager:** [Bun](https://bun.sh/)
- **Frontend Framework:** [React 19](https://react.dev/) (TypeScript)
- **Routing:** [TanStack Router](https://tanstack.com/router)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **Low-Level Core:** C, compiled via [Emscripten](https://emscripten.org/)
- **Data Visualization:** [Recharts](https://recharts.org/)

## Project Architecture

The project strictly follows the **Feature-Sliced Design (FSD)** methodology:

- `app/`: Global providers, styles, and TanStack Router tree.
- `pages/`: Page-level components (Editor, Benchmark).
- `widgets/`: Complex UI blocks (Control Panel, Results Chart, Sidebar).
- `features/`: Specific user scenarios (Run Benchmark, Change Engine, Image Upload).
- `entities/`: Domain-specific logic and stores (Image Store, Worker Host, WASM Host).
- `shared/`: Reusable UI primitives, utility libraries, and WASM glue code.

## Local Development

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- [Docker](https://www.docker.com/) (required only for compiling WASM from C source)

### Installation

```bash
# Clone the repository
git clone https://github.com/phmshk/wimage.git
cd wimage

# Install dependencies
bun install
```

### Running

```bash
# Start development server
bun dev

# Build for production
bun run build
```

### WebAssembly Compilation

The C source code is located in the `c/` directory. To recompile the WASM module:

```bash
bun run wasm
```

_Note: This command uses a Dockerized Emscripten environment defined in the `Makefile`._

