import { defineConfig } from "vite";

export default defineConfig({
    root: "./src/demo",
    build: {
        outDir: "../../demo",
        emptyOutDir: "true",
        sourcemap: true,
    },
    assetsIncludes: ["**/*.osk"],
    base: "/obviewer/",
});
