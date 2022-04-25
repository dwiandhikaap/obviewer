export interface HUDComponent {
    time?: number;
    update(value?: unknown): void;
}
