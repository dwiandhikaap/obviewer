import { Easer } from "../../../../../math/Easer";
import { Spinner } from "../Spinner";

export class DrawableSpinner {
    rpm: number;
    rotation: number;
    meter: number;
    opacity: Easer;

    // Fake spinning progress
    fakeMeter: Easer;
    fakeRotation: Easer;

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

        // Fake Spin progress
        const spinDuration = spinner.endTime - spinner.startTime;
        const rotation = (spinDuration / 60) * 220; // 220 rpm
        const progressStep = 10;

        this.fakeMeter = new Easer();
        for (let i = 1; i <= progressStep; i++) {
            this.fakeMeter.addEasing(
                spinner.startTime + ((i - 0.55) / progressStep) * spinDuration,
                spinner.startTime + ((i - 0.5) / progressStep) * spinDuration,
                (i - 1) / progressStep,
                i / progressStep
            );
        }

        this.fakeRotation = new Easer();
        this.fakeRotation.addEasing(spinner.startTime, spinner.endTime, 0, rotation);
    }

    draw(time: number) {
        this.opacity.time = time;
        this.fakeMeter.time = time;
        this.fakeRotation.time = time;
    }
}
