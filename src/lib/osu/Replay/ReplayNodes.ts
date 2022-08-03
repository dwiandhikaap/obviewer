enum Keypress {
    M1 = 1 << 0,
    M2 = 1 << 1,
    K1 = 1 << 2,
    K2 = 1 << 3,
    SMOKE = 1 << 4,
}

type KeypressType = keyof typeof Keypress;

class ReplayNode {
    prev: ReplayNode | null = null;
    next: ReplayNode | null = null;
    timestamp: number;
    deltaTime: number;
    x: number;
    y: number;
    keypress: number;

    constructor(timestamp: number, deltaTime: number, x: number, y: number, numericKeys: number) {
        this.deltaTime = deltaTime;
        this.x = x;
        this.y = y;
        this.keypress = numericKeys;
        this.timestamp = timestamp;
    }

    translate(x: number, y: number) {
        this.x += x;
        this.y += y;
    }

    translateX(x: number) {
        this.x += x;
    }

    translateY(y: number) {
        this.y += y;
    }

    isHolding(key?: KeypressType, exclusive = false) {
        if (exclusive) {
            switch (key) {
                case "K1": {
                    return this.keypress === (Keypress.K1 | Keypress.M1);
                }

                case "K2": {
                    return this.keypress === (Keypress.K2 | Keypress.M2);
                }

                case "M1": {
                    return this.keypress === Keypress.M1;
                }

                case "M2": {
                    return this.keypress === Keypress.M2;
                }

                default: {
                    return this.keypress !== 0;
                }
            }
        }

        switch (key) {
            case "K1": {
                return (this.keypress & Keypress.K1) === Keypress.K1;
            }

            case "K2": {
                return (this.keypress & Keypress.K2) === Keypress.K2;
            }

            case "M1": {
                return (this.keypress & Keypress.M1) === Keypress.M1;
            }

            case "M2": {
                return (this.keypress & Keypress.M2) === Keypress.M2;
            }

            case "SMOKE": {
                return (this.keypress & Keypress.SMOKE) === Keypress.SMOKE;
            }

            default: {
                return (this.keypress & ~(this.keypress & Keypress.SMOKE)) > 0;
            }
        }
    }

    isPressing(key?: KeypressType, exclusive = false): boolean {
        if (key === undefined) {
            const KEYS: KeypressType[] = ["K1", "K2", "M1", "M2"];
            return KEYS.some((key) => this.isPressing(key, exclusive));
        }

        if (this.prev === null) {
            return this.isHolding(key, exclusive);
        }

        return !this.prev.isHolding(key, exclusive) && this.isHolding(key, exclusive);
    }

    isReleasing(key?: KeypressType, exclusive = false) {
        if (this.next === null) {
            return this.isHolding(key, exclusive);
        }

        return !this.next.isHolding(key, exclusive) && this.isHolding(key, exclusive);
    }

    setKeypress(...keys: Keypress[]) {
        this.keypress = 0;
        this.addKeypress(...keys);
    }

    addKeypress(...keys: Keypress[]) {
        keys.forEach((key) => (this.keypress |= key));
    }

    removeKeypress(key: Keypress) {
        this.keypress = this.keypress & ~(this.keypress & key);
    }

    clone() {
        return new ReplayNode(this.timestamp, this.deltaTime, this.x, this.y, this.keypress);
    }
}

export { ReplayNode, Keypress, KeypressType };
