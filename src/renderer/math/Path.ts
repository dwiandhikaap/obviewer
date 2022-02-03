import { PathHelper } from "./PathHelper";
import { Vector2 } from "./Vector2";

type TPath = {
    (path: Vector2[]): Path;
    (path: number[][]): Path;
};

export class Path {
    private controlPoints: Vector2[];

    public points: Vector2[];

    // Maximum length of each path segment
    private PATH_DETAIL = 10;

    constructor(pathType: string, controlPoints: readonly number[][], onLattice?: boolean);
    constructor(pathType: string, controlPoints: readonly Vector2[], onLattice?: boolean);
    constructor(public pathType: string, controlPoints: readonly Vector2[] | readonly number[][], onLattice = false) {
        if (controlPoints[0] instanceof Vector2) {
            this.controlPoints = controlPoints as Vector2[];
        } else {
            this.controlPoints = controlPoints.map((controlPoint) => new Vector2(controlPoint[0], controlPoint[1]));
        }

        const curvesPath = PathHelper.SplitControlPoints(this.controlPoints);

        this.points = PathHelper.CombinePath(curvesPath, this.pathType);

        // Equal-ish distance between points no matter where it is
        this.points = PathHelper.Simplify(this.points, 1, true);

        this.points = PathHelper.Interpolate(this.points, this.PATH_DETAIL);

        if (onLattice) {
            this.points = PathHelper.RoundCoordinates(this.points);
        }
    }

    public move(startX: number, startY: number, endX: number, endY: number): void {
        for (let i = 0; i < this.points.length; i++) {
            this.points[i][0] += endX - startX;
            this.points[i][1] += endY - startY;
        }
    }

    public translate(x: number, y: number) {
        for (let i = 0; i < this.points.length; i++) {
            this.points[i][0] += x;
            this.points[i][1] += y;
        }
    }
}
