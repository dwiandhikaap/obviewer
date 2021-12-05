enum EventType {
    Background = 0,
    Video = 1,
    Break = 2,
}

interface Event {
    eventType: EventType;
    startTime: number;
}

class BackgroundEvent implements Event {
    eventType = EventType.Background;
    startTime: number;
    filename: string;
    xOffset: number;
    yOffset: number;

    constructor(startTime: number, eventParams: string[]) {
        const [filename, xOffset, yOffset] = eventParams;

        this.startTime = startTime;
        this.filename = filename;
        this.xOffset = parseInt(xOffset);
        this.yOffset = parseInt(yOffset);
    }
}

class VideoEvent implements Event {
    eventType = EventType.Video;
    startTime: number;
    filename: string;
    xOffset: number;
    yOffset: number;

    constructor(startTime: number, eventParams: string[]) {
        const [filename, xOffset, yOffset] = eventParams;

        this.startTime = startTime;
        this.filename = filename;
        this.xOffset = parseInt(xOffset);
        this.yOffset = parseInt(yOffset);
    }
}

class BreakEvent implements Event {
    eventType = EventType.Break;
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
        this.events = eventStringArray.map((eventString) => {
            const [eventType, startTime, ...eventParams] = eventString.split(",");
            switch (+eventType) {
                case EventType.Background: {
                    return new BackgroundEvent(+startTime, eventParams);
                }
                case EventType.Video: {
                    return new VideoEvent(+startTime, eventParams);
                }
                case EventType.Break: {
                    return new BreakEvent(+startTime, eventParams);
                }
            }
        });
    }
}

export { Events };
