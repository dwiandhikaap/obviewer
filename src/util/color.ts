const hexToInt = (hex: string): number => {
    if (hex.charAt(0) === "#") {
        hex = hex.slice(1);
    }

    if (hex.length != 6) {
        return NaN;
    }

    return parseInt(hex, 16);
};
export { hexToInt };
