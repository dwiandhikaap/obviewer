import { Vector2 } from "./Vector2";

class CircularArcProperties {
    isValid: boolean;
    thetaStart: number;
    thetaRange: number;
    direction: number;
    radius: number;
    center: Vector2;

    get thetaEnd() {
        return this.thetaStart + this.thetaRange * this.direction;
    }

    constructor(thetaStart: number, thetaRange: number, direction: number, radius: number, center: Vector2) {
        this.isValid = true;
        this.thetaStart = thetaStart;
        this.thetaRange = thetaRange;
        this.direction = direction;
        this.radius = radius;
        this.center = center;
    }
}

export class PathApproximator {
    private static BEZIER_TOLERANCE = 0.25;
    private static EPSILON = 1e-3;
    private static CIRCULAR_ARC_TOLERANCE = 0.25;
    private static CATMULL_DETAIL = 50;

    public static ApproximateLinear(controlPoints: readonly Vector2[]) {
        return [...controlPoints];
    }

    public static ApproximateBezier(controlPoints: readonly Vector2[]) {
        const output = new Array<Vector2>();

        let n = controlPoints.length - 1;

        if (n < 0) {
            return output;
        }

        const toFlatten = new Array<Vector2[]>();
        const freeBuffers = new Array<Vector2[]>();

        let subdivisionBuffer1 = new Array<Vector2>();
        let subdivisionBuffer2 = new Array<Vector2>();

        let leftChild = subdivisionBuffer2;

        toFlatten.push([...controlPoints]);

        while (toFlatten.length > 0) {
            let parent = toFlatten.pop();

            if (this.bezierIsFlatEnough(parent)) {
                this.bezierApproximate(parent, output, subdivisionBuffer1, subdivisionBuffer2, n + 1);

                freeBuffers.push(parent);
                continue;
            }

            let rightChild = freeBuffers.length > 0 ? freeBuffers.pop() : new Array<Vector2>();
            this.bezierSubdivide(parent, leftChild, rightChild, subdivisionBuffer1, n + 1);

            for (let i = 0; i < n + 1; i++) {
                parent[i] = leftChild[i];
            }

            toFlatten.push(rightChild);
            toFlatten.push(parent);
        }

        output.push(controlPoints[n]);

        return output;
    }

    public static ApproximateCatmull(controlPoints: readonly Vector2[]) {
        let result = new Array<Vector2>();

        for (let i = 0; i < controlPoints.length - 1; i++) {
            let v1 = i > 0 ? controlPoints[i - 1] : controlPoints[i];
            let v2 = controlPoints[i];
            let v3 = i < controlPoints.length - 1 ? controlPoints[i + 1] : v2.add(v2).subtract(v1);
            let v4 = i < controlPoints.length - 2 ? controlPoints[i + 2] : v3.add(v3).subtract(v2);

            for (let c = 0; c < this.CATMULL_DETAIL; c++) {
                result.push(this.catmullFindPoint(v1, v2, v3, v4, c / this.CATMULL_DETAIL));
                result.push(this.catmullFindPoint(v1, v2, v3, v4, (c + 1) / this.CATMULL_DETAIL));
            }
        }

        return result;
    }

    public static ApproximateCircularArc(controlPoints: readonly Vector2[]) {
        const asd = [...controlPoints];
        const pr = this.circularArcProperties(asd);

        if (!pr.isValid) {
            return [...controlPoints];
        }

        const amountPoints =
            2 * pr.radius <= this.CIRCULAR_ARC_TOLERANCE
                ? 2
                : Math.max(2, Math.ceil(pr.thetaRange / (2 * Math.acos(1 - this.CIRCULAR_ARC_TOLERANCE / pr.radius))));

        const output = new Array<Vector2>();

        for (let i = 0; i < amountPoints; ++i) {
            const fract = i / (amountPoints - 1);
            const theta = pr.thetaStart + pr.direction * fract * pr.thetaRange;
            const o = new Vector2(Math.cos(theta), Math.sin(theta)).multiply(pr.radius);
            output.push(pr.center.add(o));
        }

        return output;
    }

    private static bezierIsFlatEnough(controlPoints: Vector2[]) {
        for (let i = 1; i < controlPoints.length - 1; i++) {
            const r = controlPoints[i - 1].subtract(controlPoints[i].multiply(2)).add(controlPoints[i + 1]);

            const lengthSquared = r.lengthSquared();

            if (lengthSquared > this.BEZIER_TOLERANCE * this.BEZIER_TOLERANCE * 4) {
                return false;
            }
        }

        return true;
    }

    private static bezierSubdivide(
        controlPoints: Vector2[],
        l: Vector2[],
        r: Vector2[],
        subdivisionBuffer: Vector2[],
        count: number
    ) {
        const midpoints = subdivisionBuffer;

        for (let i = 0; i < count; i++) {
            midpoints[i] = controlPoints[i];
        }

        for (let i = 0; i < count; i++) {
            l[i] = midpoints[0];
            r[count - i - 1] = midpoints[count - i - 1];

            for (let j = 0; j < count - i - 1; j++) {
                midpoints[j] = Vector2.Midpoint(midpoints[j], midpoints[j + 1]);
            }
        }
    }

    private static bezierApproximate(
        controlPoints: Vector2[],
        output: Vector2[],
        subdivisionBuffer1: Vector2[],
        subdivisionBuffer2: Vector2[],
        count: number
    ) {
        let l = subdivisionBuffer2;
        let r = subdivisionBuffer1;

        this.bezierSubdivide(controlPoints, l, r, subdivisionBuffer1, count);

        for (let i = 0; i < count - 1; i++) {
            l[count + i] = r[i + 1];
        }

        output.push(controlPoints[0]);

        for (let i = 1; i < count - 1; i++) {
            let index = 2 * i;

            const p = l[index - 1]
                .add(l[index].multiply(2))
                .add(l[index + 1])
                .multiply(0.25);

            output.push(p);
        }
    }

    private static circularArcProperties(controlPoints: Vector2[]): Partial<CircularArcProperties> {
        const [a, b, c] = controlPoints;

        // If we have a degenerate triangle where a side-length is almost zero, then give up and fallback to a more numerically stable method.
        if (Math.abs((b[1] - a[1]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[1] - a[1])) < this.EPSILON) {
            return { isValid: false };
        }

        // See: https://en.wikipedia.org/wiki/Circumscribed_circle#Cartesian_coordinates_2
        const d = 2 * (a[0] * b.subtract(c)[1] + b[0] * c.subtract(a)[1] + c[0] * a.subtract(b)[1]);
        const aSq = a.lengthSquared();
        const bSq = b.lengthSquared();
        const cSq = c.lengthSquared();

        const center = new Vector2(
            (aSq * (b[1] - c[1]) + bSq * (c[1] - a[1]) + cSq * (a[1] - b[1])) / d,
            (aSq * (c[0] - b[0]) + bSq * (a[0] - c[0]) + cSq * (b[0] - a[0])) / d
        );

        const dA = a.subtract(center);
        const dC = c.subtract(center);

        const radius = dA.length();

        let thetaStart = Math.atan2(dA[1], dA[0]);
        let thetaEnd = Math.atan2(dC[1], dC[0]);

        while (thetaEnd < thetaStart) {
            thetaEnd += 2 * Math.PI;
        }

        let dir = 1;
        let thetaRange = thetaEnd - thetaStart;

        // Decide in which direction to draw the circle, depending on which side of
        // AC B lies.
        const orthoAtoC = c.subtract(a).rotate(-Math.PI / 2);

        if (Vector2.Dot(orthoAtoC, b.subtract(a)) < 0) {
            dir = -dir;
            thetaRange = 2 * Math.PI - thetaRange;
        }

        return new CircularArcProperties(thetaStart, thetaRange, dir, radius, center);
    }

    private static catmullFindPoint(vec1: Vector2, vec2: Vector2, vec3: Vector2, vec4: Vector2, t: number) {
        const t2 = t * t;
        const t3 = t2 * t;

        return new Vector2(
            0.5 *
                (2 * vec2[0] +
                    (-vec1[0] + vec3[0]) * t +
                    (2 * vec1[0] - 5 * vec2[0] + 4 * vec3[0] - vec4[0]) * t2 +
                    (-vec1[0] + 3 * vec2[0] - 3 * vec3[0] + vec4[0]) * t3),
            0.5 *
                (2 * vec2[1] +
                    (-vec1[1] + vec3[1]) * t +
                    (2 * vec1[1] - 5 * vec2[1] + 4 * vec3[1] - vec4[1]) * t2 +
                    (-vec1[1] + 3 * vec2[1] - 3 * vec3[1] + vec4[1]) * t3)
        );
    }
}
