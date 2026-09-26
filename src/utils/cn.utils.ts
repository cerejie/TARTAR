import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

import type { ClassValue } from "clsx";

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      shadow: ["card", "raised", "pop"],
      radius: ["shell", "pill"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
