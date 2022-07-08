import { defineConfig } from "rollup";

import json from "@rollup/plugin-json";
import inject from "@rollup/plugin-inject";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";

import dts from "rollup-plugin-dts";
import del from "rollup-plugin-delete";

export default defineConfig([
    {
        external: ["pixi.js", "buffer"],
        input: "./src/index.ts",
        output: [
            {
                name: "obviewer",
                sourcemap: true,
                file: "./build/index.js",
                format: "es",
            },
        ],
        plugins: [
            commonjs(),
            inject({ Buffer: ["buffer", "Buffer"] }),
            typescript({
                tsconfig: "./tsconfig.json",
                outDir: "./build/",
                declaration: true,
                declarationDir: "./dts_temp",
            }),
            json(),
        ],
    },
    {
        input: "./build/dts_temp/index.d.ts",
        output: [{ file: "build/index.d.ts", format: "es" }],
        plugins: [dts(), del({ hook: "buildEnd", targets: "./build/dts_temp" })],
    },
]);
