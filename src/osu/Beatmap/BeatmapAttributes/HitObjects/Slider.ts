import { HitObject, HitObjectConfig } from "./HitObject";

interface SliderConfig {
    curveType: string;
    curvePoints: number[][];
    slides: number;
    length: number;
    edgeSounds?: number[];
    edgeSets?: string[][];
}
class Slider extends HitObject {
    curveType: string;
    curvePoints: number[][];
    slides: number;
    length: number;
    edgeSounds: number[];
    edgeSets: string[][];
    constructor(hitObjectConfig: HitObjectConfig, sliderConfig: SliderConfig) {
        super(hitObjectConfig);

        const { curveType, curvePoints, slides, length, edgeSounds, edgeSets } = sliderConfig;

        this.curveType = curveType;
        this.curvePoints = curvePoints;
        this.slides = slides;
        this.length = length;
        this.edgeSounds = edgeSounds;
        this.edgeSets = edgeSets;
    }
}

export { Slider, SliderConfig };
