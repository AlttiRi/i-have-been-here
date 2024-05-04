import os   from "node:os";
import fs   from "node:fs";
import path from "node:path";
import packageJson from "./package.json" assert {type: "json"};
const {version} = packageJson;

import {sleep} from "@alttiri/util-js";


let ff = false;
let suffix = "cr";

process.argv.forEach(function (value, index, array) {
    if (value === "--firefox") {
        ff = true;
        suffix = "ff"
    }
});


// run it from package.json
try {
    const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "extn-build-"));
    console.log("tmpDir", tmpDir);
    const dot = path.toNamespacedPath(".");

    await fs.promises.cp(dot, tmpDir, {
        recursive: true,
        filter(source, destination) {
            const rel = path.relative(dot, source);
            if (!rel) {
                return true;
            }
            if (![
                "_locales", "dist-bundle", "images", "libs",
                "license", "manifest", "package", "readme",
            ].some(name => rel.startsWith(name))) {
                return false;
            }
            if (source.endsWith(".ts") && !source.endsWith(".d.ts")) {
                return false;
            }
            console.log(rel);
            return true;
        }
    });

    if (ff) {
        await fs.promises.rename(
            path.join(tmpDir, "manifest.json"),
            path.join(tmpDir, "manifest-cr.json")
        );
        await fs.promises.rename(
            path.join(tmpDir, "manifest-ff.json"),
            path.join(tmpDir, "manifest.json")
        );
    }

    await fs.promises.cp(tmpDir, `./dist-ext/ihbh-ext-${version}-${suffix}-${Math.trunc(Date.now()/1000)}`, {
        recursive: true
    });

    await sleep(999);
    await fs.promises.rm(tmpDir, {recursive: true});
} catch (err) {
    console.error(err);
}
