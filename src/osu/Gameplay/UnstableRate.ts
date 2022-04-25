import { MathHelper } from "../../math/MathHelper";

interface HitError {
    offset: number;
    result: 300 | 100 | 50 | 0;
    time: number;
}

interface UnstableRate {
    value: number;
    hitErrors: HitError[];
}

function calculateUnstableRate(hitErrors: HitError[]) {
    if (hitErrors.length <= 1) {
        return 0;
    }

    const avg = MathHelper.Average(hitErrors.map((hitError) => hitError.offset));
    const errorDelta = hitErrors.map((hitError) => (hitError.offset - avg) ** 2);
    const urSquared = MathHelper.Sum(errorDelta) / (hitErrors.length - 1);

    const ur = Math.sqrt(urSquared) * 10;

    return ur;
}

export { UnstableRate, HitError, calculateUnstableRate };
