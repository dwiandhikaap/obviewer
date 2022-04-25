import { ReplayNode } from "./ReplayNodes";

class ReplayData extends Array<ReplayNode> {
    constructor();
    constructor(replayData: string);
    constructor(replayData: ReplayNode[]);
    constructor(replayData?: string | ReplayNode[]) {
        if (replayData === undefined) {
            super();
            return;
        }

        let nodes: ReplayNode[] = [];
        if (typeof replayData === "string") {
            const parsedReplayData = replayData
                .split(",")
                .slice(0, -1) // there's an extra ',' on the last part of the replaydata string
                .map((row) => row.split("|").map(Number));

            let accumulatedTime = 0;

            for (let i = 0; i < parsedReplayData.length; i++) {
                const data = parsedReplayData[i];
                const [deltaTime, x, y, numericKeys] = data;

                accumulatedTime += deltaTime;
                const node = new ReplayNode(accumulatedTime, deltaTime, x, y, numericKeys);
                nodes.push(node);
            }

            for (let i = 0; i < parsedReplayData.length; i++) {
                if (i > 0) nodes[i].prev = nodes[i - 1];
                if (i < parsedReplayData.length - 1) {
                    nodes[i].next = nodes[i + 1];
                }
            }
        } else if (replayData instanceof ReplayNode) {
            nodes = replayData;
        }

        super(nodes.length);
        for (let i = 0; i < nodes.length; i++) {
            this[i] = nodes[i];
        }
    }

    toString() {
        let str = "";
        this.forEach((node) => {
            str += `${node.deltaTime}|${node.x}|${node.y}|${node.keypress},`;
        });

        return str;
    }

    getMultipleNear(timestamp: number, prevCount: number = 0, nextCount: number = 0) {
        const index = this.getIndexNear(timestamp);

        const startIndex = Math.max(index - prevCount, 0);
        const endIndex = Math.min(index + nextCount + 1, this.length);

        return this.slice(startIndex, endIndex);
    }

    getMultiple(from: number, to: number) {
        const startIndex = this.getIndexNear(from);
        const endIndex = this.getIndexNear(to);

        return this.slice(startIndex, endIndex);
    }

    getIndexNear(timestamp: number) {
        let mid;
        let lo = 0;
        let hi = this.length - 1;
        while (hi - lo > 1) {
            mid = Math.floor((lo + hi) / 2);
            if (this[mid].timestamp < timestamp) {
                lo = mid;
            } else {
                hi = mid;
            }
        }
        if (timestamp - this[lo].timestamp <= this[hi].timestamp - timestamp) {
            return lo;
        }
        return hi;
    }

    getNear(timestamp: number) {
        return this[this.getIndexNear(timestamp)];
    }

    getPositionAt(timestamp: number, interpolate = false): [number, number] {
        const index = this.getIndexNear(timestamp);
        const node = this[index];

        if (!interpolate) {
            return [node.x, node.y];
        }

        if (node.timestamp === timestamp) {
            return [node.x, node.y];
        }

        if (node.timestamp < timestamp) {
            const nextNode = this[index + 1];

            if (!nextNode) {
                return [node.x, node.y];
            }

            const deltaTime = nextNode.deltaTime;
            const deltaX = nextNode.x - node.x;
            const deltaY = nextNode.y - node.y;

            const timeDiff = timestamp - node.timestamp;
            const timeRatio = timeDiff / deltaTime;

            return [node.x + deltaX * timeRatio, node.y + deltaY * timeRatio];
        } else {
            const prevNode = this[index - 1];

            if (!prevNode) {
                return [node.x, node.y];
            }

            const deltaTime = node.deltaTime;
            const deltaX = node.x - prevNode.x;
            const deltaY = node.y - prevNode.y;

            const timeDiff = timestamp - prevNode.timestamp;
            const timeRatio = timeDiff / deltaTime;

            return [prevNode.x + deltaX * timeRatio, prevNode.y + deltaY * timeRatio];
        }
    }
}

export { ReplayData };
