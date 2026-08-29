// src/lib/formatters.ts

/**
 * Format numbers deterministically with spaces as thousand separators (e.g. 10 000)
 * to avoid hydration mismatches between Node.js SSR locale and browser client locale.
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return "0";
  const parts = Math.round(num).toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return parts.join(".");
}

export function formatDecimals(num: number | null | undefined, decimals = 1): string {
  if (num === null || num === undefined || isNaN(num)) return "0";
  return Number(num).toFixed(decimals);
}
