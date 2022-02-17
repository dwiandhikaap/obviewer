import { MathHelper } from "./MathHelper";
import { PathApproximator } from "./PathApproximator";
import { Vector2 } from "./Vector2";

export class PathHelper {
    //private static ANGLE_THRESHOLD = Math.PI / 8;

    public static CalculateLength(pathPoints: readonly Vector2[]): number {
        let length = 0;

        for (let i = 0; i < pathPoints.length - 1; i++) {
            const current = pathPoints[i];
            const next = pathPoints[i + 1];

            length += Vector2.Distance(current, next);
        }

        return length;
    }

    public static TrimPath(path: readonly Vector2[], maxLength: number): Vector2[] {
        const result = new Array<Vector2>();

        if (path.length < 1) {
            return result;
        }

        result.push(path[0]);

        let length = 0;

        for (let i = 1; i < path.length; i++) {
            const prev = path[i - 1];
            const current = path[i];

            const distance = Vector2.Distance(prev, current);

            if (length + distance > maxLength) {
                // interpolate between current and previous point
                const t = (maxLength - length) / distance;
                const interp = new Vector2(prev[0] * (1 - t) + current[0] * t, prev[1] * (1 - t) + current[1] * t);

                result.push(interp);
                break;
            }

            length += distance;
            result.push(path[i]);
        }

        return result;
    }

    public static GetPointAt(pathPoints: readonly Vector2[], time: number) {
        time = MathHelper.Clamp(time, 0, 1);
        let result: Vector2 | null = null;

        const totalLength = PathHelper.CalculateLength(pathPoints);
        const expectedLength = totalLength * time;

        let length = 0;

        for (let i = 1; i < pathPoints.length; i++) {
            const prev = pathPoints[i - 1];
            const current = pathPoints[i];

            const dist = Vector2.Distance(prev, current);

            if (length + dist > expectedLength) {
                result = Vector2.LinearInterpolation(prev, current, time);
                break;
            }

            length += dist;
        }

        // Just in case something weird happened related to float precision bullshit
        if (!result) {
            result = pathPoints[pathPoints.length - 1];
        }

        return result;
    }

    public static Interpolate(path: readonly Vector2[], maxSegmentLength: number) {
        const result = new Array<Vector2>();

        if (path.length < 1) {
            return result;
        }

        result.push(path[0]);

        for (let i = 1; i < path.length; i++) {
            const prev = path[i - 1];
            const current = path[i];

            const distance = Vector2.Distance(prev, current);
            const divideCount = Math.floor(distance / maxSegmentLength);

            for (let j = 0; j < divideCount; j++) {
                const t = (j + 1) / (divideCount + 1);

                result.push(new Vector2(prev[0] * (1 - t) + current[0] * t, prev[1] * (1 - t) + current[1] * t));
            }

            result.push(path[i]);
        }

        return result;
    }

    public static SplitControlPoints(controlPoints: Vector2[]): Array<Vector2[]> {
        const pathsControlPoints = new Array<Vector2[]>();

        let startIndex = 0;

        for (let i = 1; i < controlPoints.length; i++) {
            const prev = controlPoints[i - 1];
            const current = controlPoints[i];

            if (Vector2.Equals(prev, current) || i === controlPoints.length - 1) {
                const newControlPoints: Array<Vector2> = [];

                const endIndex = i === controlPoints.length - 1 ? i + 1 : i;

                for (let j = startIndex; j < endIndex; j++) {
                    newControlPoints.push(controlPoints[j]);
                }

                pathsControlPoints.push(newControlPoints);
                startIndex = i;
            }
        }

        return pathsControlPoints;
    }

    public static CombinePath(pathsControlPoints: Array<Vector2[]>, pathType: string) {
        const result: Array<Vector2> = [];

        for (let i = 0; i < pathsControlPoints.length; i++) {
            let path = new Array<Vector2>();
            const controlPoints = pathsControlPoints[i];

            switch (pathType) {
                case "B": {
                    path = PathApproximator.ApproximateBezier(controlPoints);
                    break;
                }
                case "P": {
                    path = PathApproximator.ApproximateCircularArc(controlPoints);
                    break;
                }
                case "C": {
                    path = PathApproximator.ApproximateCatmull(controlPoints);
                    break;
                }
                case "L":
                default: {
                    path = PathApproximator.ApproximateLinear(controlPoints);
                    break;
                }
            }

            // If it's not the first path, append path points except for the first point because it's already there,
            // which is the last point of the previous path
            const startIndex = i === 0 ? 0 : 1;
            for (let i = startIndex; i < path.length; i++) {
                result.push(path[i]);
            }
        }

        return result;
    }

    public static RoundCoordinates(path: Vector2[]) {
        const result: Array<Vector2> = [];
        for (let i = 0; i < path.length; i++) {
            const vec = new Vector2(Math.round(path[i][0]), Math.round(path[i][1]));
            result.push(vec);
        }
        return result;
    }

    /*
        (c) 2017, Vladimir Agafonkin
        Simplify.js, a high-performance JS polyline simplification library
        mourner.github.io/simplify-js
    */
    public static Simplify(path: Vector2[], tolerance: number, highQuality: boolean) {
        if (path.length < 2) {
            return path;
        }

        const sqTolerance = tolerance * tolerance;

        path = highQuality ? path : this.simplifyRadialDist(path, sqTolerance);
        path = this.simplifyDouglasPeucker(path, sqTolerance);

        return path;
    }

    private static simplifyRadialDist(path: Vector2[], sqTolerance: number) {
        let prevPoint = path[0];
        let newPoints = [prevPoint];

        let point: Vector2 = path[1];

        for (let i = 1, len = path.length; i < len; i++) {
            point = path[i];

            if (Vector2.DistanceSquared(point, prevPoint) > sqTolerance) {
                newPoints.push(point);
                prevPoint = point;
            }
        }

        if (prevPoint !== point) {
            newPoints.push(point);
        }

        return newPoints;
    }

    private static simplifyDouglasPeucker(path: Vector2[], sqTolerance: number): Vector2[] {
        let last = path.length - 1;

        let simplified = [path[0]];
        this.simplifyDPStep(path, 0, last, sqTolerance, simplified);
        simplified.push(path[last]);

        return simplified;
    }

    private static simplifyDPStep(
        path: Vector2[],
        first: number,
        last: number,
        sqTolerance: number,
        simplified: Vector2[]
    ) {
        let maxSqDist = sqTolerance;
        let index: number = 0;

        for (let i = first + 1; i < last; i++) {
            let sqDist = this.getSqSegDist(path[i], path[first], path[last]);

            if (sqDist > maxSqDist) {
                index = i;
                maxSqDist = sqDist;
            }
        }

        if (maxSqDist > sqTolerance) {
            if (index - first > 1) {
                this.simplifyDPStep(path, first, index, sqTolerance, simplified);
            }
            simplified.push(path[index]);
            if (last - index > 1) {
                this.simplifyDPStep(path, index, last, sqTolerance, simplified);
            }
        }
    }

    private static getSqSegDist(p: Vector2, p1: Vector2, p2: Vector2) {
        var x = p1[0],
            y = p1[1],
            dx = p2[0] - x,
            dy = p2[1] - y;

        if (dx !== 0 || dy !== 0) {
            var t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);

            if (t > 1) {
                x = p2[0];
                y = p2[1];
            } else if (t > 0) {
                x += dx * t;
                y += dy * t;
            }
        }

        dx = p[0] - x;
        dy = p[1] - y;

        return dx * dx + dy * dy;
    }
}
