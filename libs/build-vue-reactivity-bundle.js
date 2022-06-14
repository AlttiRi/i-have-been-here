import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import {rollup} from "rollup";


const bundle = await rollup({
    input: "./libs/build-entry-vue-reactivity-bundle.js",
    plugins: [
        resolve({
            browser: true,
        }),
        replace({
            "process.env.NODE_ENV": JSON.stringify("production"),
            preventAssignment: true
        })
    ]
});
await bundle.write({
    file: "./libs/vue-reactivity.js",
    format: "es"
});

