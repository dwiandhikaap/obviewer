function generateInOut(inFunc: (x: number) => number, outFunc: (x: number) => number) {
    return function (x: number) {
        return x < 0.5 ? inFunc(x * 2) / 2 : outFunc(x * 2 - 1) / 2 + 0.5;
    };
}

function elasticBase(x: number) {
    const n = 7;
    const p = 0.38;
    return 1 + -1 * Math.pow(2, -1 * n * x) * Math.cos((2 * Math.PI * x) / p);
}

function bounceBase(x: number) {
    const g = 100;
    const f = 0.4;
    const T = 2 * Math.sqrt(1 / g);
    const q = 1 - g * ((x % T) - T / 2) ** 2;

    return Math.pow(f, Math.floor(x / T)) * q;
}

export type EasingType = Exclude<keyof typeof EasingFunction, "prototype">;
export class EasingFunction {
    static Linear(x: number) {
        return x;
    }

    static InQuad(x: number) {
        return x ** 2;
    }

    static OutQuad(x: number) {
        return -((x - 1) ** 2) + 1;
    }

    static InOutQuad(x: number) {
        return generateInOut(this.InQuad, this.OutQuad)(x);
    }

    static InCubic(x: number) {
        return x ** 3;
    }

    static OutCubic(x: number) {
        return (x - 1) ** 3 + 1;
    }

    static InOutCubic(x: number) {
        return generateInOut(this.InCubic, this.OutCubic)(x);
    }

    static InQuart(x: number) {
        return x ** 4;
    }

    static OutQuart(x: number) {
        return -((x - 1) ** 4) + 1;
    }

    static InOutQuart(x: number) {
        return generateInOut(this.InQuart, this.OutQuart)(x);
    }

    static InQuint(x: number) {
        return x ** 5;
    }

    static OutQuint(x: number) {
        return (x - 1) ** 5 + 1;
    }

    static InOutQuint(x: number) {
        return generateInOut(this.InQuint, this.OutQuint)(x);
    }

    static InSine(x: number) {
        return 1 - Math.cos((x * Math.PI) / 2);
    }

    static OutSine(x: number) {
        return Math.sin((x * Math.PI) / 2);
    }

    static InOutSine(x: number) {
        return generateInOut(this.InSine, this.OutSine)(x);
    }

    static InExpo(x: number) {
        return x === 0 ? 0 : 2 ** (10 * (x - 1));
    }

    static OutExpo(x: number) {
        return x === 1 ? 1 : 1 - 2 ** (-10 * x);
    }

    static InOutExpo(x: number) {
        return generateInOut(this.InExpo, this.OutExpo)(x);
    }

    static InCirc(x: number) {
        return 1 - Math.sqrt(1 - x * x);
    }

    static OutCirc(x: number) {
        return Math.sqrt(-((x - 1) ** 2) + 1);
    }

    static InOutCirc(x: number) {
        return generateInOut(this.InCirc, this.OutCirc)(x);
    }

    static InElastic(x: number) {
        return 1 - this.OutElastic(1 - x);
    }

    static OutElastic(x: number) {
        return elasticBase(x);
    }

    static InOutElastic(x: number) {
        return generateInOut(this.InElastic, this.OutElastic)(x);
    }

    static InBounce(x: number) {
        return 1 - this.OutBounce(1 - x);
    }

    static OutBounce(x: number) {
        return 1 - (x < 0.2 ? bounceBase(x / 2 + 0.1) : bounceBase(x));
    }

    static InOutBounce(x: number) {
        return generateInOut(this.InBounce, this.OutBounce)(x);
    }
}
