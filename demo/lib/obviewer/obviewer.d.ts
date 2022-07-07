/// <reference types="node" />
import { Buffer } from "buffer";
declare enum Mod {
    None = 0,
    NoFail = 1,
    Easy = 2,
    TouchDevice = 4,
    Hidden = 8,
    HardRock = 16,
    SuddenDeath = 32,
    DoubleTime = 64,
    Relax = 128,
    HalfTime = 256,
    Nightcore = 512,
    Flashlight = 1024,
    Autoplay = 2048,
    SpunOut = 4096,
    Relax2 = 8192,
    Perfect = 16384,
    TargetPractice = 8388608,
    ScoreV2 = 536870912
}
declare class Mods {
    constrain: boolean;
    private _numeric;
    private _list;
    constructor(value?: number);
    get reducedListString(): string[];
    get listString(): string[];
    get reducedList(): Mod[];
    get list(): Mod[];
    get numeric(): number;
    set numeric(value: number);
    contains(list: Array<Mod>): boolean;
    contains(mod: Mod): boolean;
    set(mod: Mod, enable: boolean): this | undefined;
    private _enable;
    private _disable;
    enable(mod: Mod): this | undefined;
    disable(mod: Mod): this | undefined;
}
declare class Colours {
    combo: number[][];
    sliderTrackOverride: number[];
    sliderBorder: number[];
    // "key : value" String Format Parsing
    parseStringArray(colourStringArray: string[]): void;
    get hex(): string[];
}
declare class Difficulty {
    mods: Mods;
    private hp;
    private cs;
    private od;
    private ar;
    sliderMultiplier: number;
    sliderTickRate: number;
    parseStringArray(args: string[], mods?: Mods): void;
    // Source : https://github.com/ppy/osu/blob/3f31cb39c003990d01bad26cc610553a6e936851/osu.Game.Rulesets.Osu/Objects/OsuHitObject.cs
    get fadeIn(): number;
    getPreempt(mods?: Mods): number;
    getAR(mods?: Mods): number;
    getOD(mods?: Mods): number;
    getCS(mods?: Mods): number;
    getHP(mods?: Mods): number;
    getObjectRadius(mods?: Mods): number;
    getHitWindows(mods?: Mods): [
        number,
        number,
        number
    ];
}
declare class Editor {
    bookmarks: number[];
    distanceSpacing: number;
    beatDivisor: number;
    gridSize: number;
    timelineZoom: number;
    parseStringArray(args: string[]): void;
}
/* enum EventType {
Background = 0,
Video = 1,
Break = 2,
} */
type EventType = "background" | "video" | "break";
interface Event {
    eventType: EventType;
    startTime: number;
}
declare class Events {
    events: Event[];
    parseStringArray(eventStringArray: string[]): void;
}
declare class General {
    audioFilename: string;
    audioLeadIn: number;
    previewTime: number;
    countdown: number;
    sampleSet: string;
    stackLeniency: number;
    mode: number;
    letterboxInBreaks: number;
    widescreenStoryboard: number;
    useSkinSprites: number;
    overlayPosition: string;
    skinPreference: string;
    epilepsyWarning: number;
    countdownOffset: number;
    sampleMatchPlaybackRate: number;
    parseStringArray(args: string[]): void;
}
type EasingType = Exclude<keyof typeof EasingFunction, "prototype">;
declare class EasingFunction {
    static Linear(x: number): number;
    static InQuad(x: number): number;
    static OutQuad(x: number): number;
    static InOutQuad(x: number): number;
    static InCubic(x: number): number;
    static OutCubic(x: number): number;
    static InOutCubic(x: number): number;
    static InQuart(x: number): number;
    static OutQuart(x: number): number;
    static InOutQuart(x: number): number;
    static InQuint(x: number): number;
    static OutQuint(x: number): number;
    static InOutQuint(x: number): number;
    static InSine(x: number): number;
    static OutSine(x: number): number;
    static InOutSine(x: number): number;
    static InExpo(x: number): number;
    static OutExpo(x: number): number;
    static InOutExpo(x: number): number;
    static InCirc(x: number): number;
    static OutCirc(x: number): number;
    static InOutCirc(x: number): number;
    static InElastic(x: number): number;
    static OutElastic(x: number): number;
    static InOutElastic(x: number): number;
    static InBounce(x: number): number;
    static OutBounce(x: number): number;
    static InOutBounce(x: number): number;
}
interface Easing {
    startTime: number;
    endTime: number;
    targetFrom: number;
    targetTo: number;
    easingType: EasingType;
}
// Holds possibly different values depending on the given time
declare class Easer {
    fallbackValue: number;
    easings: Easing[];
    time: number;
    constructor(fallbackValue?: number);
    static CreateEasing(startTime: number, endTime: number, targetFrom: number, targetTo: number, easingType?: EasingType): Easing;
    get value(): number;
    getValueAt(time: number): number;
    // I hate TypeScript function overloading so much 🤮
    addEasing(...easings: Easing[]): Easer;
    addEasing(startTime: number, endTime: number, targetFrom: number, targetTo: number, easingType?: EasingType): Easer;
    removeEasing(...easings: Easing[]): void;
    removeAllEasings(): void;
}
declare abstract class DrawableHitObject<T> {
    private animations;
    // Called every game tick, depends on the replay node density and playback rate
    update(time: number): void;
    // Called every frames, ideally 60 frames per seconds / every 16.6 ms
    draw(time: number): void;
    protected playAnimation(animationType: T, easer: Easer, easings: Easing[]): void;
    protected removeFutureAnimation(time: number): void;
    animate(animationType: T, time: number): void;
}
type HitCircleAnimation = "SHAKE" | "HIT" | "MISS";
declare class DrawableHitCircle extends DrawableHitObject<HitCircleAnimation> {
    hitObject: HitCircle;
    opacity: Easer;
    approachCircleOpacity: Easer;
    approachCircleScale: Easer;
    positionOffset: {
        x: Easer;
        y: Easer;
    };
    scale: Easer;
    constructor(hitObject: HitCircle);
    draw(time: number): void;
    animate(animation: HitCircleAnimation, time: number): void;
}
declare enum HitObjectType {
    HitCircle = 1,
    Slider = 2,
    Spinner = 8,
    NewCombo = 4,
    ColorSkip1 = 16,
    ColorSkip2 = 32,
    ColorSkip3 = 64
}
declare class Hitsample {
    normalSet: number;
    additionSet: number;
    index: number;
    volume: number;
    filename: string;
    constructor(normalSet: number, additionSet: number, index: number, volume: number, filename: string);
}
interface HitObjectConfig {
    startPos: [
        number,
        number
    ];
    endPos: [
        number,
        number
    ];
    startTime: number;
    endTime: number;
    type: HitObjectType;
    hitSound: number;
    hitSample?: Hitsample;
    comboCount: number;
    objectIndex: number;
    difficulty: Difficulty;
}
declare class HitObject {
    startPos: [
        number,
        number
    ];
    endPos: [
        number,
        number
    ];
    startTime: number;
    endTime: number;
    type: HitObjectType;
    hitSound: number;
    hitSample?: Hitsample;
    comboCount: number;
    objectIndex: number;
    colour: string;
    difficulty: Difficulty;
    stackCount: number;
    stackOffset: number;
    constructor(hitObjectConfig: HitObjectConfig);
    draw(time: number): void;
    update(time: number): void;
    getStackedStartPos(): number[];
    getStackedEndPos(): number[];
    setNewCombo(): void;
    isNewCombo(): number;
    isHitCircle(): number;
    isSlider(): number;
    isSpinner(): number;
    isVisibleAt(time: number): boolean;
    // How many colour(s) are skipped on the new combo
    getColourHax(): number;
}
declare class HitCircle extends HitObject {
    drawable: DrawableHitCircle;
    constructor(hitObjectConfig: HitObjectConfig);
    draw(time: number): void;
    update(time: number): void;
}
type IAddOverload = {
    (value: number): Vector2;
    (tuple: [
        number,
        number
    ]): Vector2;
    (vector: Vector2): Vector2;
};
type ISubtractOverload = {
    (value: number): Vector2;
    (tuple: [
        number,
        number
    ]): Vector2;
    (vector: Vector2): Vector2;
};
declare class Vector2 {
    [index: number]: number;
    constructor(numbers: number[]);
    constructor(x: number, y: number);
    add: IAddOverload;
    subtract: ISubtractOverload;
    multiply: (scalar: number) => Vector2;
    lengthSquared(): number;
    length(): number;
    dot(vector: Vector2): number;
    normalize(): Vector2;
    toArray(): number[];
    toTuple(): [
        number,
        number
    ];
    rotate(angle: number): Vector2;
    clone(): Vector2;
    static From(numbers: [
        number,
        number
    ]): Vector2;
    static From(x: number, y: number): Vector2;
    static ToArray(vector: Vector2): number[];
    static Normalize(vector: Vector2): Vector2;
    static PerpendicularRight(vector: Vector2): Vector2;
    static PerpendicularLeft(vector: Vector2): Vector2;
    static Add(vector1: Vector2, vector2: Vector2): Vector2;
    static Add(vector: Vector2, tuple: [
        number,
        number
    ]): Vector2;
    static Add(vector: Vector2, value: number): Vector2;
    static Subtract(vector: Vector2, vector2: Vector2): Vector2;
    static Subtract(vector: Vector2, tuple: [
        number,
        number
    ]): Vector2;
    static Subtract(vector: Vector2, value: number): Vector2;
    static Multiply(vector: Vector2, scalar: number): Vector2;
    static DistanceSquared(vector1: Vector2 | [
        number,
        number
    ], vector2: Vector2 | [
        number,
        number
    ]): number;
    static Distance(vector1: Vector2 | [
        number,
        number
    ], vector2: Vector2 | [
        number,
        number
    ]): number;
    static LengthSquared(vector: Vector2): number;
    static Length(vector: Vector2): number;
    static Midpoint(vector1: Vector2, vector2: Vector2): Vector2;
    static Dot(vector1: Vector2, vector2: Vector2): number;
    static Equals(vector1: Vector2, vector2: Vector2): boolean;
    static LinearInterpolation(vector1: Vector2, vector2: Vector2, t: number): Vector2;
    static CloseEnough(vector1: [
        number,
        number
    ], vector2: [
        number,
        number
    ], epsilon: number): boolean;
    static CloseEnough(vector1: [
        number,
        number
    ], vector2: Vector2, epsilon: number): boolean;
    static CloseEnough(vector1: Vector2, vector2: [
        number,
        number
    ], epsilon: number): boolean;
    static CloseEnough(vector1: Vector2, vector2: Vector2, epsilon: number): boolean;
    static Angle(from: [
        number,
        number
    ], to: [
        number,
        number
    ]): number;
    static Angle(from: [
        number,
        number
    ], to: Vector2): number;
    static Angle(from: Vector2, to: [
        number,
        number
    ]): number;
    static Angle(from: Vector2, to: Vector2): number;
}
// kinda buggy dont touch pls
declare class Path {
    pathType: string;
    private maxLength?;
    private controlPoints;
    points: Vector2[];
    // Maximum length of each path segment
    private PATH_DETAIL;
    constructor(pathType: string, controlPoints: readonly number[][], maxLength?: number);
    constructor(pathType: string, controlPoints: readonly Vector2[], maxLength?: number);
    move(startX: number, startY: number, endX: number, endY: number): this;
    translate(x: number, y: number): this;
    scale(scale: number): Path;
    scale(x: number, y: number): Path;
    getLength(): number;
    // TODO: optimize this , should be easy
    getPointAt(t: number): Vector2;
    getTranslatedPoints(vector: [
        number,
        number
    ]): Vector2[];
    getTranslatedPoints(vector: Vector2): Vector2[];
    getTranslatedPoints(translation: number): Vector2[];
    getTranslatedPoints(x: number, y?: number): Vector2[];
    clone(): Path;
}
declare class Timing {
    time: number;
    meter: number;
    sampleSet: number;
    sampleIndex: number;
    volume: number;
    uninhereted: number;
    effects: number;
    beatLength: number;
    beatLengthBase: number;
    constructor(time: number, _beatlength: number, base: number, meter: number, sampleSet: number, sampleIndex: number, volume: number, uninhereted: number, effects: number);
    get bpm(): number;
}
declare class TimingPoints {
    timings: Timing[];
    parseStringArray(timingStringArray: string[]): void;
    getTimingAt(time: number): Timing;
    getInheritedTimingAt(time: number): Timing;
    getUninheritedTimingAt(time: number): Timing;
}
declare class DrawableSliderTick {
    sliderTick: SliderTick;
    opacity: Easer;
    scale: Easer;
    constructor(sliderTick: SliderTick);
    draw(time: number): void;
}
declare class DrawableReverseTick {
    reverseTick: SliderReverseTick;
    opacity: Easer;
    scale: Easer;
    constructor(reverseTick: SliderReverseTick);
    draw(time: number): void;
}
type SliderAnimation = "FOLLOW_START" | "UNFOLLOW" | "FOLLOW_END";
declare class DrawableSlider extends DrawableHitObject<SliderAnimation> {
    slider: Slider;
    progress: number;
    progressPosition: [
        number,
        number
    ];
    isVisible: boolean;
    isSliding: boolean;
    isReversed: boolean;
    slideIndex: number;
    bodyOpacity: Easer;
    headOpacity: Easer;
    ballOpacity: Easer;
    followCircleOpacity: Easer;
    followCircleScale: Easer;
    approachCircleOpacity: Easer;
    approachCircleScale: Easer;
    constructor(slider: Slider);
    draw(time: number): void;
    // TODO: create a proper "fadeTo" type of animation
    animate(animationType: SliderAnimation, time: number): void;
}
declare class SliderTick {
    slider: Slider;
    time: number;
    position: [
        number,
        number
    ];
    drawable: DrawableSliderTick;
    constructor(slider: Slider, time: number, position: [
        number,
        number
    ]);
}
declare class SliderReverseTick {
    slider: Slider;
    time: number;
    position: [
        number,
        number
    ];
    isReversed: boolean;
    drawable: DrawableReverseTick;
    constructor(slider: Slider, time: number, position: [
        number,
        number
    ], isReversed: boolean);
}
interface SliderConfig {
    curveType: string;
    curvePoints: number[][];
    curvePath: Path;
    slides: number;
    length: number;
    edgeSounds: number[];
    edgeSets: string[][];
}
declare class Slider extends HitObject {
    private timing;
    curveType: string;
    curvePoints: number[][];
    curvePath: Path;
    slides: number;
    length: number;
    edgeSounds: number[];
    edgeSets: string[][];
    startAngle: number;
    endAngle: number;
    duration: number;
    sliderTicks: SliderTick[];
    reverseTicks: SliderReverseTick[];
    drawable: DrawableSlider;
    constructor(hitObjectConfig: HitObjectConfig, sliderConfig: SliderConfig, timing: TimingPoints);
    private initializeTiming;
    // TODO: fix bug where ticks fall on the different places for long fast repeating slider
    private initializeSliderTicks;
    private initializeReverseTicks;
    draw(time: number): void;
    getPositionAt(time: number): [
        number,
        number
    ];
    getStackedPositionAt(time: number): [
        number,
        number
    ];
    getSlideDirectionAt(time: number): 1 | -1;
    getSlideIndexAt(time: number): number;
    getSlideStartTime(index: number): number;
    getCurvePath(): Path;
    getStackedCurvePath(): Path;
    getSliderTicks(): SliderTick[];
    getStackedSliderTicks(): SliderTick[];
    getReverseTicks(): SliderReverseTick[];
    getStackedReverseTicks(): SliderReverseTick[];
}
declare class DrawableSpinner {
    spinner: Spinner;
    rpm: number;
    rotation: number;
    meter: number;
    opacity: Easer;
    constructor(spinner: Spinner);
    draw(time: number): void;
}
declare class Spinner extends HitObject {
    drawable: DrawableSpinner;
    constructor(hitObjectConfig: HitObjectConfig);
    draw(time: number): void;
}
declare class HitObjects {
    objects: HitObject[];
    parseStringArray(hitObjectStringArray: string[], difficulty: Difficulty, timing: TimingPoints): void;
    applyColour(colour: string[]): void;
    // source : https://gist.githubusercontent.com/peppy/1167470/raw/a665e0774b040f7a930c436baa534b002b1c23ef/osuStacking.cs
    applyStacking(difficulty: Difficulty, stackLeniency: number): void;
    getIndexNear(timestamp: number): number;
}
declare class Metadata {
    title: string;
    titleUnicode: string;
    artist: string;
    artistUnicode: string;
    creator: string;
    version: string;
    source: string;
    tags: string;
    beatmapId: number;
    beatmapSetId: number;
    parseStringArray(args: string[]): void;
}
declare class Beatmap {
    private mapData;
    general: General;
    editor: Editor;
    metadata: Metadata;
    difficulty: Difficulty;
    events: Events;
    timingPoints: TimingPoints;
    colours: Colours;
    hitObjects: HitObjects;
    constructor(mapData?: string, mods?: Mods);
    private parseBeatmap;
    getMods(): Mods;
    setMods(mods: Mods): void;
    getBackgroundFileNames(): string[];
    getAudioFilename(): string;
}
declare enum Keypress {
    M1 = 1,
    M2 = 2,
    K1 = 4,
    K2 = 8,
    SMOKE = 16
}
type KeypressType = keyof typeof Keypress;
declare class ReplayNode {
    prev: ReplayNode | null;
    next: ReplayNode | null;
    timestamp: number;
    deltaTime: number;
    x: number;
    y: number;
    keypress: number;
    constructor(timestamp: number, deltaTime: number, x: number, y: number, numericKeys: number);
    translate(x: number, y: number): void;
    translateX(x: number): void;
    translateY(y: number): void;
    isHolding(key?: KeypressType, exclusive?: boolean): boolean;
    isPressing(key?: KeypressType, exclusive?: boolean): boolean;
    isReleasing(key?: KeypressType, exclusive?: boolean): boolean;
    setKeypress(...keys: Keypress[]): void;
    addKeypress(...keys: Keypress[]): void;
    removeKeypress(key: Keypress): void;
    clone(): ReplayNode;
}
declare class ReplayData extends Array<ReplayNode> {
    constructor();
    constructor(replayData: string);
    constructor(replayData: ReplayNode[]);
    toString(): string;
    getMultipleNear(timestamp: number, prevCount?: number, nextCount?: number): ReplayNode[];
    getMultiple(from: number, to: number): ReplayNode[];
    getIndexNear(timestamp: number): number;
    getNear(timestamp: number): ReplayNode;
    getPositionAt(timestamp: number, interpolate?: boolean): [
        number,
        number
    ];
}
declare class Replay {
    gameMode: number;
    gameVersion: number;
    beatmapMD5: string;
    playerName: string;
    replayMD5: string;
    number_300s: number;
    number_100s: number;
    number_50s: number;
    gekis: number;
    katus: number;
    misses: number;
    score: number;
    maxCombo: number;
    perfectCombo: number;
    mods: Mods;
    life_bar: string;
    timestamp: Date;
    replayLength: number;
    replayData: ReplayData;
    unknown: number;
    toBlob(): Promise<Blob>;
    static FromBuffer(buffer: Buffer): Promise<Replay>;
    static FromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<Replay>;
}
interface ReplayTaleConfig {
    container: string;
}
declare class ReplayTale {
    beatmap: Beatmap | null;
    replay: Replay | null;
    isModsOverriden: Boolean;
    private _replayModsNumeric;
    private mods;
    private renderer;
    private audioHandler;
    private gameInstance;
    isPaused: boolean;
    private timestamp;
    private _playbackRate;
    get playbackRate(): number;
    set playbackRate(value: number);
    constructor(replaytaleConfig: ReplayTaleConfig);
    loadBeatmapAssets(audio?: HTMLAudioElement, background?: HTMLImageElement): void;
    loadBeatmap(beatmap: Beatmap): void;
    loadReplay(replay: Replay): void;
    enableModsOverride(mods: Mods): void;
    disableModsOverride(): void;
    private _autoSyncCount;
    private _autoSyncLastTime;
    private lastFrameTimestamp;
    private loop;
    play(): void;
    pause(): void;
    seek(timestamp: number): void;
}
// fuck generics
interface ISettings {
    AppWidth: number;
    AppHeight: number;
    AudioVolume: number;
    AudioOffset: number;
    AudioAutoSyncEnabled: boolean;
    AudioAutoSyncThresholdMS: number;
    AudioAutoSyncDetectIssue: boolean;
    EnableGameCheck: boolean;
}
type SettingsParameters = keyof ISettings;
type SettingsValue<T extends SettingsParameters> = ISettings[keyof Pick<ISettings, T>];
declare class Settings {
    private static _settings;
    private static listeners; // hack mode
    static addUpdateListener<K extends keyof ISettings>(key: K, listener: (value: SettingsValue<K>) => void): void;
    static removeUpdateListener<K extends keyof ISettings>(key: K, listener: (value: SettingsValue<K>) => void): void;
    static set<K extends SettingsParameters>(key: K, value: SettingsValue<K>): void;
    static get<K extends SettingsParameters>(key: K): ISettings[K];
    static toString(): string;
    static fromString(settings: string): void;
    private static notify;
}
export { ReplayTale as default, Mods, Mod, Replay, ReplayNode, ReplayData, Beatmap, Settings };
