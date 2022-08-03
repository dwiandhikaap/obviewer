/**
 * @type {import('vite').UserConfig}
 */
import { resolve } from "path";
import { defineConfig } from "rollup";

export default defineConfig({
    root: "./src/demo",
    build: {
        lib: {
            entry: resolve(__dirname, "src/lib/app.ts"),
            name: "Obviewer",
            fileName: "obviewer",
            formats: ["umd", "es", "cjs"],
        },
        outDir: "../../dist",
        emptyOutDir: "true",
    },
});
