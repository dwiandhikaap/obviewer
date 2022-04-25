import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import dts from "rollup-plugin-dts";

export default [
    {
        external: ["pixi.js", "buffer"],
        input: "./src/module.ts",
        output: [
            {
                name: "replaytale",
                sourcemap: true,
                file: "./dist/module.js",
                format: "es",
            },
        ],
        plugins: [
            typescript({
                tsconfig: "./tsconfig.json",
            }),
            json(),
        ],
    },
    {
        input: "./dist/dts/module.d.ts",
        output: [{ file: "dist/index.d.ts", format: "es" }],
        plugins: [dts()],
    },
];
