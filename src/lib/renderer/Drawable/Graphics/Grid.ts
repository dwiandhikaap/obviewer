import { Graphics } from "pixi.js";

type GridSize = "PIXEL" | "TINY" | "SMALL" | "MEDIUM" | "LARGE";

class Grid extends Graphics {
    constructor(width: number, height: number, gridSize: GridSize, color: number, alpha: number) {
        super();
        let cellSize = 4;
        switch (gridSize) {
            case "PIXEL":
                cellSize = 1;
                break;
            case "TINY":
                cellSize = 4;
                break;
            case "SMALL":
                cellSize = 8;
                break;
            case "MEDIUM":
                cellSize = 16;
                break;
            case "LARGE":
                cellSize = 32;
                break;
        }

        const horizontalScale = width / 512;
        const verticalScale = height / 384;

        const scale = Math.min(horizontalScale, verticalScale);
        cellSize *= scale;

        const horizontalGridCount = Math.floor(width / cellSize);
        const verticalGridCount = Math.floor(height / cellSize);

        // use line to draw the grid
        this.lineStyle(1, color, alpha);
        for (let i = 0; i <= horizontalGridCount; i++) {
            this.moveTo(i * cellSize, 0);
            this.lineTo(i * cellSize, height);
        }

        for (let i = 0; i <= verticalGridCount; i++) {
            this.moveTo(0, i * cellSize);
            this.lineTo(width, i * cellSize);
        }

        // create center horizontal and vertical bold line
        this.lineStyle(2, color, alpha);
        this.moveTo(width / 2, 0);
        this.lineTo(width / 2, height);

        this.moveTo(0, height / 2);
        this.lineTo(width, height / 2);

        this.endFill();
    }
}

export { Grid, GridSize };
