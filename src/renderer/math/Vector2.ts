type IAddOverload = {
    (value: number): Vector2;
    (vector: Vector2): Vector2;
};

type ISubtractOverload = {
    (value: number): Vector2;
    (vector: Vector2): Vector2;
};

export class Vector2 {
    [index: number]: number;

    constructor(numbers: number[]);
    constructor(x: number, y: number);
    constructor(x: number | number[], y?: number) {
        if (typeof x === "number") {
            this[0] = x;
            this[1] = y;
        } else {
            this[0] = x[0];
            this[1] = x[1];
        }
    }

    add: IAddOverload = (valueOrVector: number | Vector2): Vector2 => {
        if (typeof valueOrVector === "number") {
            return new Vector2(this[0] + valueOrVector, this[1] + valueOrVector);
        }

        return new Vector2(this[0] + valueOrVector[0], this[1] + valueOrVector[1]);
    };

    subtract: ISubtractOverload = (valueOrVector: number | Vector2) => {
        if (typeof valueOrVector === "number") {
            return new Vector2(this[0] - valueOrVector, this[1] - valueOrVector);
        }

        return new Vector2(this[0] - valueOrVector[0], this[1] - valueOrVector[1]);
    };

    multiply = (scalar: number): Vector2 => {
        return new Vector2(this[0] * scalar, this[1] * scalar);
    };

    lengthSquared(): number {
        return Math.pow(this[0], 2) + Math.pow(this[1], 2);
    }

    length(): number {
        return Math.sqrt(this.lengthSquared());
    }

    dot(vector: Vector2): number {
        return Math.min(this[0] * vector[0] + this[1] * vector[1], 1);
    }

    normalize(): Vector2 {
        return new Vector2([this[0] / this.length(), this[1] / this.length()]);
    }

    toArray(): number[] {
        return [this[0], this[1]];
    }

    rotate(angle: number): Vector2 {
        return new Vector2(
            this[0] * Math.cos(angle) - this[1] * Math.sin(angle),
            this[0] * Math.sin(angle) + this[1] * Math.cos(angle)
        );
    }

    public static From(numbers: [number, number]): Vector2;
    public static From(x: number, y: number): Vector2;
    public static From(numberOrArray: number | number[], y?: number): Vector2 {
        if (numberOrArray instanceof Array) {
            return new Vector2(numberOrArray[0], numberOrArray[1]);
        }

        return new Vector2(numberOrArray, y);
    }

    public static ToArray(vector: Vector2): number[] {
        return [vector[0], vector[1]];
    }

    public static Normalize(vector: Vector2): Vector2 {
        return new Vector2(
            vector[0] / Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2)),
            vector[1] / Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2))
        );
    }

    public static PerpendicularRight(vector: Vector2): Vector2 {
        return new Vector2(-vector[1], vector[0]);
    }

    public static Add(vector1: Vector2, vector2: Vector2): Vector2;
    public static Add(vector1: Vector2, value: number): Vector2;
    public static Add(vector1: Vector2, vector2OrValue: Vector2 | number): Vector2 {
        if (typeof vector2OrValue === "number") {
            return new Vector2(vector1[0] + vector2OrValue, vector1[1] + vector2OrValue);
        }

        return new Vector2(vector1[0] + vector2OrValue[0], vector1[1] + vector2OrValue[1]);
    }

    public static Subtract(vector: Vector2, vector2: Vector2): Vector2;
    public static Subtract(vector: Vector2, value: number): Vector2;
    public static Subtract(vector1: Vector2, vector2OrValue: Vector2 | number): Vector2 {
        if (typeof vector2OrValue === "number") {
            return new Vector2(vector1[0] - vector2OrValue, vector1[1] - vector2OrValue);
        }

        return new Vector2(vector1[0] - vector2OrValue[0], vector1[1] - vector2OrValue[1]);
    }

    public static Multiply(vector: Vector2, scalar: number): Vector2 {
        return new Vector2(vector[0] * scalar, vector[1] * scalar);
    }

    public static DistanceSquared(vector1: Vector2, vector2: Vector2): number {
        return Math.pow(vector1[0] - vector2[0], 2) + Math.pow(vector1[1] - vector2[1], 2);
    }

    public static Distance(vector1: Vector2, vector2: Vector2): number {
        return Math.sqrt(this.DistanceSquared(vector1, vector2));
    }

    public static LengthSquared(vector: Vector2): number {
        return Math.pow(vector[0], 2) + Math.pow(vector[1], 2);
    }

    public static Length(vector: Vector2): number {
        return Math.sqrt(this.LengthSquared(vector));
    }

    public static Midpoint(vector1: Vector2, vector2: Vector2): Vector2 {
        return new Vector2((vector1[0] + vector2[0]) / 2, (vector1[1] + vector2[1]) / 2);
    }

    public static Dot(vector1: Vector2, vector2: Vector2): number {
        return Math.min(vector1[0] * vector2[0] + vector1[1] * vector2[1], 1);
    }

    public static Equals(vector1: Vector2, vector2: Vector2): boolean {
        return vector1[0] === vector2[0] && vector1[1] === vector2[1];
    }
}
