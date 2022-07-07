import ts from "rollup-plugin-ts";
import json from "@rollup/plugin-json";

export default [
    {
        external: ["pixi.js", "buffer"],
        input: "./src/index.ts",
        output: [
            {
                name: "obviewer",
                sourcemap: true,
                file: "./demo/lib/obviewer/obviewer.js",
                format: "es",
            },
            {
                name: "obviewer",
                sourcemap: true,
                file: "./dist/obviewer.js",
                format: "es",
            },
        ],
        plugins: [
            ts({
                tsconfig: "./tsconfig.json",
            }),
            json(),
        ],
    },
];
