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


import fs from "node:fs";
const f1 = (await fs.promises.readFile("./node_modules/@vue/reactivity/dist/reactivity.d.ts")).toString();
let   f2 = (await fs.promises.readFile("./node_modules/@vue-reactivity/watch/dist/index.d.ts")).toString();
f2 = f2.replace("import { Ref, ComputedRef, ReactiveEffectOptions } from '@vue/reactivity';", "");
f2 = f2.replace("* @depreacted", "* @deprecated");
f2 = f2.slice(1);
await fs.promises.writeFile("./libs/vue-reactivity.d.ts", f1 + f2)

