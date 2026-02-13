# JS vs. WASM Image Processing Benchmark

This project is a Single Page Application (SPA) designed to compare the performance of JavaScript and WebAssembly (C) when executing image processing algorithms.

The application allows users to upload images and apply various filters—ranging from simple pixel manipulation to complex mathematical convolutions—using both JavaScript and C (via WebAssembly). The primary goal is to measure execution time and analyze the performance benefits of low-level languages in a browser environment.

## Project Status and Roadmap

This project is currently under active development.

Live demo can be viewed here:  **[\[ Live Demo \]](https://phmshk.github.io/wimage/)**

**Current Focus:** Phase 1 - JavaScript Implementation and Architecture.

- [x] **Project Initialization**

- [x] **Core Architecture (Phase 1)**
  - [x] Implement Feature-Sliced Design structure
  - [x] Create main layout and canvas component
  - [x] Implement Web Worker infrastructure with Transferable Objects

- [x] **JavaScript Algorithms (Phase 1)**
  - [x] Level 1: Invert, Grayscale, Sepia
  - [x] Level 2: Gaussian Blur, Sobel, Sharpen
  - [x] Level 3: Median, Kuwahara, Bilateral

- [ ] **WASM Integration (Phase 2)**
  - [ ] Docker environment for Emscripten
  - [ ] C implementation of algorithms
  - [ ] Benchmarking system

## Key Features

- **Mobile-First Design:** A responsive interface optimized for mobile devices and desktop.
- **Non-Blocking UI:** All heavy computations are offloaded to Web Workers to keep the main thread responsive.
- **Zero-Copy Data Transfer:** Uses Transferable Objects (ArrayBuffer) to minimize memory overhead.
- **Performance Benchmarking:** Real-time measurement of execution speed (Planned for Phase 2).

## Technology Stack

- **Runtime & Package Manager:** Bun
- **Frontend:** React, TypeScript, Vite
- **State Management:** Zustand
- **Styling:** Tailwind CSS, Shadcn UI
- **Testing:** Vitest and Munit

## Algorithms Implemented

The project implements algorithms categorized by computational complexity:

### Level 1: Linear Complexity O(N)

Simple pixel-by-pixel manipulation without dependencies on neighboring pixels.

- Invert
- Grayscale
- Sepia

### Level 2: Convolution Matrices

Algorithms that require processing a kernel (e.g., 3x3 or 5x5 matrix) around each pixel.

- Gaussian Blur
- Sobel Edge Detection
- Sharpen

### Level 3: Complex / Non-Linear

Resource-intensive algorithms requiring sorting or statistical analysis of local areas.

- Median Filter
- Kuwahara Filter (Oil painting effect)
- Bilateral Filter

## Project Architecture

The project follows a Feature-Sliced Design (FSD) methodology:

- `app/`: Global configuration and providers.
- `pages/`: Application views (Main Editor).
- `widgets/`: Compositional blocks (Workspace, Control Panel).
- `features/`: User scenarios (Apply Filter, Upload Image).
- `entities/`: Business logic stores (Image Store).
- `shared/`: Reusable UI components and utility libraries.

## Getting Started

### Prerequisites

- Bun (v1.0 or higher)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/phmshk/wimage.git
    cd wimage
    ```

2.  Install dependencies using Bun:
    ```bash
    bun install
    ```

### Running the Application

Start the development server:

```bash
bun dev


```

