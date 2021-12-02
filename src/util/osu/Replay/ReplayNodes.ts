enum Keypress {
    M1 = 1 << 0,
    M2 = 1 << 1,
    K1 = 1 << 2,
    K2 = 1 << 3,
    Smoke = 1 << 4
}

class ReplayNode {
    deltaTime: number;
    x: number;
    y: number;
    keypress: number;
    constructor(deltaTime: number, x: number, y: number, numericKeys: number) {
        this.deltaTime = deltaTime;
        this.x = x;
        this.y = y;
        this.keypress = numericKeys;
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

    setKeypress(...keys: Keypress[]) {
        this.keypress = 0;
        this.addKeypress(...keys);
    }

    addKeypress(...keys: Keypress[]) {
        keys.forEach((key) => (this.keypress |= key));
    }

    removeKeypress(key?: Keypress, ...keys: Keypress[]) {
        if (key === undefined && keys.length === 0) {
            this.keypress = 0;
            return;
        }

        this.keypress ^= key;
        keys.forEach((key) => {
            console.log(key);
            this.keypress ^= key;
        });
    }
}

export { ReplayNode, Keypress };
