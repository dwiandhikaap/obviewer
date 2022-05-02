import { cloneGameState, DEFAULT_GAMESTATE, GameState } from "./types/GameState";

var CACHE_STRIDE = 20;

// TODO: when a state changes, clear ALL the cache next to it
// TODO: Idea : when generating the nextState, in the hitObjectStates array, if a state is not changed, don't clone it, just copy it (by reference), otherwise we clone it
//              might save few megabytes of memory and speed up the Game State cloning, but idk
//              however this might cause some issue with mutability bullshit if we're not careful
export class StateHandler {
    private stateCache: Readonly<GameState>[] = [];
    private currentState: GameState;

    constructor(private stateUpdater: (gameState: Readonly<GameState>) => Readonly<GameState>) {
        this.stateCache[0] = DEFAULT_GAMESTATE;
        this.currentState = DEFAULT_GAMESTATE;
    }

    private updateState(gameState: Readonly<GameState>): GameState {
        return this.stateUpdater(gameState);
    }

    requestState(stateIndex: number): GameState {
        this.currentState = this._requestState(stateIndex);
        return this.currentState;
    }

    private _requestState(stateIndex: number): GameState {
        if (stateIndex === this.currentState.index) {
            return this.currentState;
        }

        if (stateIndex <= 0) {
            return this.stateCache[0];
        }

        if (stateIndex % CACHE_STRIDE === 0) {
            if (this.stateCache[stateIndex / CACHE_STRIDE] === undefined) {
                const prevState = this.requestState(stateIndex - 1);
                this.stateCache[stateIndex / CACHE_STRIDE] = cloneGameState(this.updateState(prevState));
            }

            return cloneGameState(this.stateCache[stateIndex / CACHE_STRIDE]);
        }

        const prevState = this.requestState(stateIndex - 1);
        return this.updateState(prevState);
    }
}
