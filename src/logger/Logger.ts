class Logger {
    private static logs: { [name: string]: any } = {};
    public static view: HTMLDivElement = document.createElement("div");

    static log(name: string, value: any) {
        if (Logger.logs[name] === undefined) {
            Logger.logs[name] = value;

            const child = document.createElement("div");
            child.id = `logger-${name}`;
            child.textContent = `${name}: ${value}`;
            Logger.view.appendChild(child);
        }

        const element = document.getElementById(`logger-${name}`);
        if (element !== null) {
            element.textContent = `${name}: ${value}`;
        }
    }
}

export { Logger };
