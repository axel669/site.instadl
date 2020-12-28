import svelte from "rollup-plugin-svelte"
import commonjs from "rollup-plugin-commonjs"
import resolve from "rollup-plugin-node-resolve"
import htmlTemplate from "rollup-plugin-generate-html-template"
import del from "rollup-plugin-delete"

export default {
    input: "./src/main.js",
    output: {
        file: `./output/app-${Date.now().toString(16)}.js`,
        format: "iife",
    },
    plugins: [
        del({
            targets: "./output/*"
        }),
        svelte(),
        resolve(),
        commonjs(),
        htmlTemplate({
            template: "./src/index.html",
            target: "./output/index.html"
        })
    ]
}
