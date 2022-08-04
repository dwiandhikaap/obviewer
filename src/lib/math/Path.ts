import { PathHelper } from "./PathHelper";
import { Vector2 } from "./Vector2";

export class Path {
    private controlPoints: Vector2[];
    private _cachedPointsTime: number[];
    private _cachedPointsAngle: number[];

    public points: Vector2[];

    constructor(pathType: string, controlPoints: readonly number[][], maxLength?: number);
    constructor(pathType: string, controlPoints: readonly Vector2[], maxLength?: number);
    constructor(public pathType: string, controlPoints: readonly Vector2[] | readonly number[][], private maxLength?: number) {
        if (controlPoints[0] instanceof Vector2) {
            this.controlPoints = controlPoints as Vector2[];
        } else {
            this.controlPoints = controlPoints.map((controlPoint) => new Vector2(controlPoint[0], controlPoint[1]));
        }

        const curvesPath = PathHelper.SplitControlPoints(this.controlPoints);

        this.points = PathHelper.CombinePath(curvesPath, this.pathType);

        if (maxLength) {
            this.points = PathHelper.TrimPath(this.points, maxLength);
        }

        this._cachedPointsTime = calcPointsTime(this.points);
        this._cachedPointsAngle = calcPointsAngle(this.points);
    }

    public move(startX: number, startY: number, endX: number, endY: number) {
        for (let i = 0; i < this.points.length; i++) {
            this.points[i][0] += endX - startX;
            this.points[i][1] += endY - startY;
        }
        return this;
    }

    public translate(x: number, y: number) {
        for (let i = 0; i < this.points.length; i++) {
            this.points[i][0] += x;
            this.points[i][1] += y;
        }
        return this;
    }

    public scale(scale: number): Path;
    public scale(x: number, y: number): Path;
    public scale(xOrScale: number, y?: number): Path {
        if (y === undefined) {
            for (let i = 0; i < this.points.length; i++) {
                this.points[i][0] *= xOrScale;
                this.points[i][1] *= xOrScale;
            }
        } else {
            for (let i = 0; i < this.points.length; i++) {
                this.points[i][0] *= xOrScale;
                this.points[i][1] *= y;
            }
        }

        return this;
    }

    public getLength(): number {
        return PathHelper.CalculateLength(this.points);
    }

    public getIndexAt(t: number): number {
        const maxLength = this._cachedPointsTime.length;
        let result = 0;

        if (t > this._cachedPointsTime[maxLength - 1]) {
            result = maxLength - 1;
        } else {
            for (let i = 1; i < this._cachedPointsTime.length; i++) {
                if (this._cachedPointsTime[i] > t) {
                    result = i - 1;
                    break;
                }
            }
        }

        return result;
    }

    public getPointAt(t: number) {
        let i1 = this.getIndexAt(t);

        if (i1 === this._cachedPointsTime.length - 1) {
            return this.points[i1];
        }

        let i2 = i1 + 1;
        let weight = (t - this._cachedPointsTime[i1]) / (this._cachedPointsTime[i2] - this._cachedPointsTime[i1]);

        const x = this.points[i1][0] * (1 - weight) + this.points[i2][0] * weight;
        const y = this.points[i1][1] * (1 - weight) + this.points[i2][1] * weight;

        return new Vector2(x, y);
    }

    public getPointTupleAt(t: number): [number, number] {
        let i1 = this.getIndexAt(t);

        if (i1 === this._cachedPointsTime.length - 1) {
            return this.points[i1].toTuple();
        }

        let i2 = i1 + 1;
        let weight = (t - this._cachedPointsTime[i1]) / (this._cachedPointsTime[i2] - this._cachedPointsTime[i1]);

        const x = this.points[i1][0] * (1 - weight) + this.points[i2][0] * weight;
        const y = this.points[i1][1] * (1 - weight) + this.points[i2][1] * weight;

        return [x, y];
    }

    public getAngleAt(t: number): number {
        let i1 = this.getIndexAt(t);
        const angle = this._cachedPointsAngle[i1];

        return angle;
    }

    public getTranslatedPoints(vector: [number, number]): Vector2[];
    public getTranslatedPoints(vector: Vector2): Vector2[];
    public getTranslatedPoints(translation: number): Vector2[];
    public getTranslatedPoints(x: number, y?: number): Vector2[];
    public getTranslatedPoints(xOrTranslationOrVector: number | Vector2 | [number, number], y?: number): Vector2[] {
        const result: Vector2[] = [];

        if (typeof xOrTranslationOrVector === "number") {
            const x = xOrTranslationOrVector;

            if (y === undefined) {
                for (let i = 0; i < this.points.length; i++) {
                    result.push(this.points[i].add(x));
                }
            } else {
                for (let i = 0; i < this.points.length; i++) {
                    const point = this.points[i].add([x, y]);
                    result.push(point);
                }
            }
        } else {
            const vector = xOrTranslationOrVector;

            for (let i = 0; i < this.points.length; i++) {
                const point = this.points[i].add([vector[0], vector[1]]);
                result.push(point);
            }
        }
        return result;
    }

    public clone(): Path {
        const controlPoints = this.controlPoints.map((point) => point.clone());
        return new Path(this.pathType, controlPoints, this.maxLength);
    }
}

function calcPointsTime(points: Vector2[]) {
    const result: number[] = [0];
    const totalLength = PathHelper.CalculateLength(points);
    let length = 0;
    for (let i = 0; i < points.length - 1; i++) {
        length += Vector2.Distance(points[i], points[i + 1]) / totalLength;
        result.push(length);
    }

    return result;
}

function calcPointsAngle(points: Vector2[]) {
    const result: number[] = [];
    for (let i = 0; i < points.length - 1; i++) {
        result.push(Vector2.Angle(points[i], points[i + 1]));
    }
    return result;
}
