export class MathHelper {
    public static BinomialCoefficient(n: number, k: number) {
        return this.Factorial(n) / (this.Factorial(k) * this.Factorial(n - k));
    }

    public static Factorial(n: number): number {
        return n < 2 ? 1 : n * this.Factorial(n - 1);
    }
}
