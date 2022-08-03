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

class BackgroundEvent implements Event {
    eventType: EventType = "background";
    startTime: number;
    filename: string;
    xOffset: number;
    yOffset: number;

    constructor(startTime: number, eventParams: string[]) {
        const [filename, xOffset, yOffset] = eventParams;

        this.startTime = startTime;
        this.filename = filename.replace(/^"(.*)"$/, "$1");
        this.xOffset = parseInt(xOffset);
        this.yOffset = parseInt(yOffset);
    }
}

class VideoEvent implements Event {
    eventType: EventType = "video";
    startTime: number;
    filename: string;
    xOffset: number;
    yOffset: number;

    constructor(startTime: number, eventParams: string[]) {
        const [filename, xOffset, yOffset] = eventParams;

        this.startTime = startTime;
        this.filename = filename.replace(/^"(.*)"$/, "$1");
        this.xOffset = parseInt(xOffset);
        this.yOffset = parseInt(yOffset);
    }
}

class BreakEvent implements Event {
    eventType: EventType = "break";
    startTime: number;
    endTime: number;

    constructor(startTime: number, eventParams: string[]) {
        this.startTime = startTime;
        this.endTime = parseInt(eventParams[0]);
    }
}

class Events {
    events: Event[] = [];

    parseStringArray(eventStringArray: string[]) {
        this.events = eventStringArray
            .map((eventString) => {
                const [eventType, startTime, ...eventParams] = eventString.split(",");
                switch (eventType.toLowerCase()) {
                    case "0": {
                        return new BackgroundEvent(+startTime, eventParams);
                    }
                    case "video":
                    case "1": {
                        return new VideoEvent(+startTime, eventParams);
                    }
                    case "2": {
                        return new BreakEvent(+startTime, eventParams);
                    }
                }
            })
            .filter((event) => event !== undefined) as Array<Event>;
    }
}

export { Events, BackgroundEvent, VideoEvent, BreakEvent };
