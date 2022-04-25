export function hexToInt(hex: string): number {
    if (hex.charAt(0) === "#") {
        hex = hex.slice(1);
    }

    if (hex.length != 6) {
        return NaN;
    }

    return parseInt(hex, 16);
}

export function intToRGB(i: number): [number, number, number] {
    const r = (i >> 16) & 0xff;
    const g = (i >> 8) & 0xff;
    const b = i & 0xff;

    return [r, g, b];
}

export function rgbToInt(r: number, g: number, b: number): number {
    return (r << 16) + (g << 8) + b;
}

export const RGBToHSB = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;
    const v = Math.max(r, g, b),
        n = v - Math.min(r, g, b);
    const h = n === 0 ? 0 : n && v === r ? (g - b) / n : v === g ? 2 + (b - r) / n : 4 + (r - g) / n;
    return [60 * (h < 0 ? h + 6 : h), v && (n / v) * 100, v * 100];
};

export const HSBToRGB = (h: number, s: number, b: number): [number, number, number] => {
    s /= 100;
    b /= 100;
    const k = (n: number) => (n + h / 60) % 6;
    const f = (n: number) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
    return [255 * f(5), 255 * f(3), 255 * f(1)];
};
