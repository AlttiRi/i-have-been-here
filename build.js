import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import packageJson from "./package.json" assert {type: "json"};
const {version} = packageJson;

import {sleep} from "./util.js";

const ff = true;

try {
    const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "extn-build-"));
    console.log("tmpDir", tmpDir);
    const dot = path.toNamespacedPath(".");

    await fs.promises.cp(".", tmpDir, {
        recursive: true,
        filter(source, destination) {
            const rel = path.relative(dot, source);
            if ([".git", ".idea", "node_modules", "old", "dist"].some(name => rel === name)) {
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

    await fs.promises.cp(tmpDir, `./dist/demo-ext-${version}-${ff ? "ff-" : ""}${Math.trunc(Date.now()/1000)}`, {
        recursive: true
    });

    await sleep(999);
    await fs.promises.rm(tmpDir, {recursive: true});
} catch (err) {
    console.error(err);
}
