import { Beatmap } from "../../Beatmap/Beatmap";
import { HitObject } from "../../Beatmap/BeatmapAttributes/HitObjects";
import { ReplayNode } from "../../Replay/ReplayNodes";
import { GameState } from "../GameState";
import { IObjectUpdateData } from "../GameState/generator";

// Mutates the GameState
export type Ruleset<T extends HitObject> = (
    hitObject: T,
    beatmap: Beatmap,
    node: ReplayNode,
    gameState: GameState,
    objectUpdateData: IObjectUpdateData
) => void;
