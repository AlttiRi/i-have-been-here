import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import {rollup} from "rollup";


const bundle = await rollup({
    input: "./build/vue-reactivity-bundle-entry-point.js",
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
const reactivity = (await fs.promises.readFile("./node_modules/@vue/reactivity/dist/reactivity.d.ts")).toString();
const watch      = (await fs.promises.readFile("./node_modules/@vue-reactivity/watch/dist/index.d.ts")).toString();
const shared     = (await fs.promises.readFile("./node_modules/@vue/shared/dist/shared.d.ts")).toString();
let result =
    shared
    +
    reactivity
        .replace("import { IfAny } from '@vue/shared';", "")
    +
    watch
        .replace("import { Ref, ComputedRef, ReactiveEffectOptions } from '@vue/reactivity';", "")
        .replace("* @depreacted", "* @deprecated")
        .slice(1);
await fs.promises.writeFile("./libs/vue-reactivity.d.ts", result);

// dts-bundle-generator
//   libs/build-vue-reactivity-bundle-entry-point.ts
//   --external-inlines=@vue/reactivity @vue-reactivity/watch @vue/shared
//   -o libs/vue-reactivity.d.ts

