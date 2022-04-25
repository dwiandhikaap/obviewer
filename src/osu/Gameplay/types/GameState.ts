import { KeypressHitInfo } from "../../Graphics/HUD/KeypressOverlay";
import { HitResultInfo } from "../../Graphics/HUD/HitResultOverlay";
import { UnstableRate } from "../UnstableRate";
import { HitObjectState } from "./HitObjectState";

export const DEFAULT_GAMESTATE: GameState = {
    time: 0,
    hitObjectStates: [],
    index: 0,
    keypressInfo: {
        hitCount: { K1: 0, K2: 0, M1: 0, M2: 0 },
        keypress: new Set(),
    },

    hitResultInfo: {
        missCount: 0,
        hit50Count: 0,
        hit100Count: 0,
        hit300Count: 0,
    },

    unstableRate: {
        value: 0.0,
        hitErrors: [],
    },
};

export interface GameState {
    time: number;
    index: number;
    readonly hitObjectStates: HitObjectState[];
    keypressInfo: KeypressHitInfo;
    hitResultInfo: HitResultInfo;
    unstableRate: UnstableRate;
}

export function cloneGameState(state: GameState) {
    const result: GameState = {
        time: state.time,
        index: state.index,
        hitObjectStates: state.hitObjectStates.map((hitObjectState) => {
            return { ...hitObjectState };
        }),
        keypressInfo: {
            hitCount: {
                K1: state.keypressInfo.hitCount.K1,
                K2: state.keypressInfo.hitCount.K2,
                M1: state.keypressInfo.hitCount.M1,
                M2: state.keypressInfo.hitCount.M2,
            },
            keypress: new Set(state.keypressInfo.keypress),
        },

        hitResultInfo: {
            missCount: state.hitResultInfo.missCount,
            hit50Count: state.hitResultInfo.hit50Count,
            hit100Count: state.hitResultInfo.hit100Count,
            hit300Count: state.hitResultInfo.hit300Count,
        },

        unstableRate: {
            value: state.unstableRate.value,
            hitErrors: state.unstableRate.hitErrors.map((hitError) => {
                return {
                    offset: hitError.offset,
                    result: hitError.result,
                    time: hitError.time,
                };
            }),
        },
    };

    return result;
}
