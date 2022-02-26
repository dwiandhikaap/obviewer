enum Keypress {
    M1 = 1 << 0,
    M2 = 1 << 1,
    K1 = 1 << 2,
    K2 = 1 << 3,
    SMOKE = 1 << 4,
}

class ReplayNode {
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

    isPressing() {
        return this.keypress > 0;
    }

    isPressingM1() {
        return this.keypress & Keypress.M1;
    }

    isPressingM2() {
        return this.keypress & Keypress.M2;
    }

    isPressingK1() {
        return this.keypress & Keypress.K1;
    }

    isPressingK2() {
        return this.keypress & Keypress.K2;
    }

    isPressingSmoke() {
        return this.keypress & Keypress.SMOKE;
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
