import { Easer, Easing } from "./Easer";

class Animation<T> {
    public animationEasers: { easer: Easer; easings: Easing[] }[] = [];

    constructor(public animationType: T) {}

    public setSequence(easer: Easer, easings: Easing[]) {
        const easerIndex = this.animationEasers.findIndex((animationEaser) => animationEaser.easer === easer);
        if (easerIndex === -1) {
            this.animationEasers.push({ easer, easings: easings });
            easer.addEasing(...easings);
            return;
        }

        const oldEasings = this.animationEasers[easerIndex].easings;
        this.animationEasers[easerIndex].easer.removeEasing(...oldEasings);
        easer.addEasing(...easings);
    }

    public addSequence(easer: Easer, easings: Easing[]) {
        const easerIndex = this.animationEasers.findIndex((animationEaser) => animationEaser.easer === easer);
        if (easerIndex === -1) {
            this.setSequence(easer, easings);
            return;
        }

        this.animationEasers[easerIndex].easings.push(...easings);
        easer.addEasing(...easings);
    }

    public removeSequence(sequence: { easer: Easer; easings: Easing[] }) {
        const easerIndex = this.animationEasers.findIndex((animationEaser) => animationEaser.easer === sequence.easer);

        this.animationEasers[easerIndex].easer.removeEasing(...sequence.easings);
        this.animationEasers.splice(easerIndex, 1);
    }
}

export { Animation };
