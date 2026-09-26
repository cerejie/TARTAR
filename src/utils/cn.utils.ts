import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

import type { ClassValue } from "clsx";

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      shadow: ["panel", "raised", "pop"],
      radius: ["panel", "pill"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
