import { HUDComponent } from "./HUDComponent";

interface HitResultInfo {
    missCount: number;
    hit50Count: number;
    hit100Count: number;
    hit300Count: number;
}

class HitResultOverlay implements HUDComponent {
    public hitResultInfo: HitResultInfo = {
        missCount: 0,
        hit50Count: 0,
        hit100Count: 0,
        hit300Count: 0,
    };

    public update(hitResultInfo: HitResultInfo): void {
        this.hitResultInfo = hitResultInfo;
    }
}
export { HitResultOverlay, HitResultInfo };
