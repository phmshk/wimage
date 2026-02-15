export const FILTER_DESCRIPTIONS = {
  grayscale: "Removes color, turning the photo into black and white.",
  inversion: "Swaps all colors like an old film negative.",
  sepia: "Adds a vintage brownish tone, like an old photograph.",
  gaussianBlur: "Makes the image look foggy or out of focus.",
  sharpen: "Makes details pop and edges look clearer.",
  sobel: "Turns the image into a sketch by outlining all edges.",
  median: "Removes small specks and dots (noise) while keeping shapes clear.",
  kuwahara: "Makes the photo look like an artistic oil painting.",
  bilateral: "Smooths surfaces (like skin) but keeps the edges sharp.",
} as const;
