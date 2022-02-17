export class MathHelper {
    public static BinomialCoefficient(n: number, k: number) {
        return this.Factorial(n) / (this.Factorial(k) * this.Factorial(n - k));
    }

    public static Factorial(n: number): number {
        return n < 2 ? 1 : n * this.Factorial(n - 1);
    }

    public static Clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    public static Lerp(t: number, from: number, to: number, targetFrom: number, targetTo: number): number {
        return (t / (to - from)) * (targetTo - targetFrom) + targetFrom;
    }
}
