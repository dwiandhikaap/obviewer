import { Container, Graphics, Text } from "pixi.js";
import { Difficulty } from "../../osu/Beatmap/BeatmapAttributes/Difficulty";
import { URBar } from "../../osu/Graphics/HUD/URBar";
import { HUDDrawProperty } from "../Layers/HUDOverlay";

// 50, 100, 300
var BAR_COLOR = [0xdcad45, 0x57e216, 0x32bde6];
var BAR_THICKNESS = 5;
var BAR_WIDTH_MULTIPLIER = 1.5;
var BAR_DEFAULT = [49.5, 99.5, 149.5];
var BAR_COUNT = 30;

function createBar(hitWindows: number[], scale: number) {
    const bar = new Container();

    hitWindows
        .slice()
        .reverse()
        .forEach((hitWindow, index) => {
            const childBar = new Graphics();
            const barWidth = (hitWindow * scale * BAR_WIDTH_MULTIPLIER) / 2;
            const barHeight = BAR_THICKNESS * scale;

            childBar.beginFill(BAR_COLOR[index]);
            childBar.drawRect(-barWidth, 0, 2 * barWidth, barHeight);

            bar.addChild(childBar);
        });

    return bar;
}

function createTicks(count: number, scale: number) {
    const result: Graphics[] = [];

    for (let i = 0; i < count; i++) {
        const tick = new Graphics();
        tick.beginFill(0xffffff);
        tick.drawRect(1, -BAR_THICKNESS * scale, 2, BAR_THICKNESS * 3 * scale);

        tick.alpha = 0.0;

        result.push(tick);
    }

    return result;
}

function createURText(scale: number) {
    return new Text("0 UR", {
        fill: "white",
        fontSize: 11 * scale,
        fontFamily: "Tahoma",
        strokeThickness: 2,
        align: "center",
    });
}

class URBarDrawable extends Container {
    urBar: URBar | null = null;

    private _difficulty: Difficulty;
    public get difficulty(): Difficulty {
        return this._difficulty;
    }
    public set difficulty(diff: Difficulty) {
        this._difficulty = diff;

        this.generateBar(diff.getHitWindows(), this.drawProperty.scale);
    }

    private barTicks: Graphics[] = [];
    private urText: Text;

    constructor(private drawProperty: HUDDrawProperty) {
        super();

        const { resolution, scale } = drawProperty;

        this.generateBar(BAR_DEFAULT, scale);

        this.urText = createURText(scale);
        this.addChild(this.urText);
        this.urText.anchor.set(0.5, 1.5);

        this.barTicks = createTicks(BAR_COUNT, scale);
        this.barTicks.forEach((tick) => this.addChild(tick));

        this.position.x = resolution[0] / 2;
        this.position.y = resolution[1] - BAR_THICKNESS - 20;
    }

    private generateBar(hitWindows: number[], scale: number) {
        this.children.length && this.removeChildAt(0);
        const bar = createBar(hitWindows, scale);
        this.addChildAt(bar, 0);
    }

    bind(urBar: URBar) {
        this.urBar = urBar;
    }

    draw(time: number) {
        if (this.urBar === null) {
            return;
        }

        const startIndex = this.urBar.getTickIndexAt(time - 20000);
        const endIndex = this.urBar.getTickIndexAt(time);
        let tickIndex = 0;

        for (let i = startIndex; i < endIndex; i++) {
            const tick = this.urBar.ticks[i];
            const barTick = this.barTicks[tickIndex];

            barTick.alpha = tick.opacity.getValueAt(time);
            barTick.position.x = (tick.offset / 2) * this.drawProperty.scale * BAR_WIDTH_MULTIPLIER;
            barTick.tint = tick.color;

            tickIndex = (tickIndex + 1) % this.barTicks.length;
        }

        this.urText.text = `${Math.floor(this.urBar.urValue)} UR`;
    }
}

export { URBarDrawable };
