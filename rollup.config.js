import { defineConfig } from "rollup";

import dts from "rollup-plugin-dts";
import del from "rollup-plugin-delete";

export default defineConfig({
    input: "./dist/dts_temp/app.d.ts",
    output: [{ file: "dist/obviewer.d.ts", format: "es" }],
    plugins: [dts(), del({ hook: "buildEnd", targets: "./dist/dts_temp" })],
});
