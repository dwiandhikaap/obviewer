/**
 * @type {import('vite').UserConfig}
 */
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
    root: "./src/demo",
    build: {
        lib: {
            entry: resolve(__dirname, "src/lib/app.ts"),
            name: "Obviewer",
            fileName: "obviewer",
            formats: ["cjs", "umd", "es"],
        },
        outDir: "../../dist",
        emptyOutDir: "true",
        sourcemap: true,
    },
});
