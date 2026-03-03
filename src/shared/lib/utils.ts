import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatTime = (ms: number) => {
  const seconds = (ms / 1000).toFixed(2);
  return `${ms.toFixed(2)} ms (${seconds} s)`;
};

export const formatBytes = (bytes?: number, decimals = 2) => {
  if (!bytes || bytes === 0) return "0 Bytes";

  const k = 1000; // Используем 1000 вместо 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
  );
};
