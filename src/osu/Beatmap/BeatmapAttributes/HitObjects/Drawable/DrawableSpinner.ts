import { Spannable } from "../../../../../math/Spannable";
import { Spinner } from "../Spinner";

export class DrawableSpinner {
    rpm: number;
    rotation: number;
    meter: number;
    opacity: Spannable;

    constructor(public spinner: Spinner) {
        const opacity = new Spannable();

        const appearTime = spinner.startTime - spinner.difficulty.getPreempt();
        const dissapearTime = spinner.endTime + 150;

        opacity.addSpan(appearTime, spinner.startTime, 0, 1);
        opacity.addSpan(spinner.startTime, spinner.endTime, 1, 1);
        opacity.addSpan(spinner.endTime, dissapearTime, 1, 0);

        this.rpm = 0;
        this.rotation = 0;
        this.meter = 0;
        this.opacity = opacity;
    }

    update(time: number) {
        this.opacity.time = time;
    }
}
