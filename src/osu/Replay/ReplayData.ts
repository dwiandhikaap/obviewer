import { ReplayNode } from "./ReplayNodes";

class ReplayData {
    nodes = new Array<ReplayNode>();
    constructor(replayData: string);
    constructor(replayData: ReplayNode[]);
    constructor(replayData: string | ReplayNode[]) {
        if (typeof replayData === "string") {
            this.nodes = replayData
                .split(",")
                .slice(0, -1) // there's an extra ',' on the last part of the replaydata string
                .map((row) => row.split("|").map(Number))
                .map((row) => new ReplayNode(row[0], row[1], row[2], row[3]));
        } else if (replayData instanceof ReplayNode) {
            this.nodes = replayData;
        }
    }

    toString() {
        let str = "";
        this.nodes.forEach((node) => {
            str += `${node.deltaTime}|${node.x}|${node.y}|${node.keypress},`;
        });

        return str;
    }

    // JS array operators/methods
    concat(...replayData: ReplayData[]) {
        replayData.forEach((data) => {
            this.nodes.concat(data.nodes);
        });
    }

    fill(replayNode: ReplayNode, start: number = 0, end: number = this.nodes.length) {
        this.nodes.fill(replayNode, start, end);
    }

    filter(predicate: (value: ReplayNode) => boolean, start: number = 0, end: number = this.nodes.length - 1) {
        const result = [];
        for (let i = start; i <= end; i++) {
            predicate(this.nodes[i]) && result.push(this.nodes[i]);
        }
        this.nodes = result;
    }

    getReplayData(timestamp: number, prevCount: number = 0, nextCount: number = 0) {
        let accumulatedTime = 0;
        let index = 0;
        while (true) {
            accumulatedTime += this.nodes[index].deltaTime;
            if (accumulatedTime >= timestamp) {
                break;
            }
            index++;
        }

        const startIndex = index - prevCount;
        const endIndex = index + nextCount + 1;

        return this.nodes.slice(startIndex, endIndex);
    }
}

export { ReplayData };
