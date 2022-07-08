import { defineConfig } from "rollup";

import json from "@rollup/plugin-json";
import inject from "@rollup/plugin-inject";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";

export default defineConfig([
    {
        external: ["pixi.js", "buffer"],
        input: "./src/index.ts",
        output: [
            {
                name: "obviewer",
                sourcemap: true,
                file: "./demo/lib/obviewer/index.js",
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
                declarationDir: "./",
            }),
            json(),
        ],
    },
]);