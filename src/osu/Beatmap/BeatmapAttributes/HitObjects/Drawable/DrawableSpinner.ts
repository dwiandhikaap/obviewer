import { Easer } from "../../../../../math/Easer";
import { Spinner } from "../Spinner";

export class DrawableSpinner {
    rpm: number;
    rotation: number;
    meter: number;
    opacity: Easer;

    constructor(public spinner: Spinner) {
        const opacity = new Easer();

        const appearTime = spinner.startTime - spinner.difficulty.getPreempt();
        const dissapearTime = spinner.endTime + 150;

        opacity.addEasing(appearTime, spinner.startTime, 0, 1);
        opacity.addEasing(spinner.startTime, spinner.endTime, 1, 1);
        opacity.addEasing(spinner.endTime, dissapearTime, 1, 0);

        this.rpm = 0;
        this.rotation = 0;
        this.meter = 0;
        this.opacity = opacity;
    }

    draw(time: number) {
        this.opacity.time = time;
    }
}
