/** Normalize user hex to #RRGGBB or null if invalid. */
export function normalizeHex(input: string): string | null {
  const s = input.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(s)) {
    return null;
  }
  return `#${s.toLowerCase()}`;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = normalizeHex(hex);
  if (!n) {
    return { r: 0, g: 0, b: 0 };
  }
  const h = n.slice(1);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const to = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function withAlpha(hex: string, alpha: number): string {
  const n = normalizeHex(hex);
  if (!n) {
    return `rgba(0,0,0,${alpha})`;
  }
  const { r, g, b } = hexToRgb(n);
  return `rgba(${r},${g},${b},${alpha})`;
}
