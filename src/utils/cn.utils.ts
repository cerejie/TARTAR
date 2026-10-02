import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

import type { ClassValue } from "clsx";

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["micro", "caption", "label", "body", "emphasis", "section", "page-title", "money-lg", "hero"],
      shadow: ["panel", "card", "menu", "overlay"],
      radius: ["control", "card", "surface", "sheet", "panel", "pill"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
