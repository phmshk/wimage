import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatTime = (ms: number) => {
  const seconds = (ms / 1000).toFixed(2);
  return `${ms.toFixed(2)} ms (${seconds} s)`;
};
