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

    isHolding(key?: KeypressType) {
        switch (key) {
            case "K1": {
                return this.keypress & Keypress.K1;
            }

            case "K2": {
                return this.keypress & Keypress.K2;
            }

            case "M1": {
                return this.keypress & Keypress.M1;
            }

            case "M2": {
                return this.keypress & Keypress.M2;
            }

            default: {
                return this.keypress > 0;
            }
        }
    }

    isKeyPressed(key?: KeypressType) {
        if (this.prev === null) {
            return this.isHolding(key);
        }

        return !this.prev.isHolding(key) && this.isHolding(key);
    }

    isKeyReleased(key?: KeypressType) {
        if (this.next === null) {
            return this.isHolding(key);
        }

        return !this.next.isHolding(key) && this.isHolding(key);
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
}

export { ReplayNode, Keypress };
