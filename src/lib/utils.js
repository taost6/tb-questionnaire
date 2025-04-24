import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

/** Tailwind クラス結合 & 重複解消 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
