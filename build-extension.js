import os     from "node:os";
import fs     from "node:fs";
import path   from "node:path";
import crypto from "node:crypto";
import {pipeline} from "node:stream/promises";
import archiver   from "archiver";
import {exists, listFiles} from "@alttiri/util-node-js";

import {createRequire} from "node:module";
const require_ex = createRequire(import.meta.url);

const packageJson = require_ex("./package.json");
const {version} = packageJson;



let ff = false;
let suffix = "cr";

process.argv.forEach(function (value, _index, _array) {
    if (value === "--firefox") {
        ff = true;
        suffix = "ff"
    }
});


// run it from package.json
try {
    const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "extn-build-"));
    console.log("tmpDir", tmpDir);

    const projectDir = path.toNamespacedPath(".");
    await fs.promises.cp(projectDir, tmpDir, {
        recursive: true,
        filter(source, destination) {
            const rel = path.relative(projectDir, source);
            if (!rel) {
                return true;
            }
            if (![
                "_locales", "bundle", "images", "libs",
                "license", "manifest", "package", "readme",
            ].some(name => rel.startsWith(name))) {
                return false;
            }
            console.log(rel);
            return true;
        }
    });

    for (const pathParts of [
        ["src", "content"],
        ["web_accessible_resources"],
    ]) {
        const contentFrom = path.join(projectDir, ...pathParts);
        const contentTo   = path.join(tmpDir,     ...pathParts);
        await fs.promises.cp(contentFrom, contentTo, {
            recursive: true,
        });
    }

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

    // ---
    const folPath = `./dist/ihbh-ext-${suffix}`;
    const folPathTemp = folPath + "-temp";

    await fs.promises.cp(tmpDir, folPathTemp, {
        recursive: true
    });
    await fs.promises.rm(tmpDir, {recursive: true});


    const targetHashes = await getFileHashMap(folPath);
    const tempHashes   = await getFileHashMap(folPathTemp);
    for (const [relPath, sha1] of tempHashes) {
        if (targetHashes.get(relPath) === sha1) {
            const old = path.resolve(folPath,     relPath);
            const tmp = path.resolve(folPathTemp, relPath);
            await fs.promises.rename(old, tmp);
        }
    }

    if (await exists(folPath)) {
        await fs.promises.rm(folPath, {recursive: true});
    }
    await fs.promises.rename(folPathTemp, folPath);
    // ---

    const zipPath = `./dist/ihbh-ext-${suffix}-${version}-${Math.trunc(Date.now()/1000)}.zip`;
    await zipDirectory(folPath, zipPath);

    const hashInput = [...tempHashes.values()].reduce((acc, hash) => acc + hash, "");
    const sha1 = crypto.createHash("sha1").update(hashInput).digest("hex");
    console.log(sha1);

    const newZipPath = `./dist/ihbh-ext-${suffix}-${version}-${sha1.slice(0, 10)}.zip`;
    await fs.promises.rename(zipPath, newZipPath);

} catch (err) {
    console.error(err);
}

async function getFileHashMap(filepath) {
    const hashMap = new Map();
    for await (const item of listFiles({filepath, stats: false})) {
        if ("errors" in item) {
            continue;
        }
        const file = await fs.promises.readFile(item.path);
        const sha1 = crypto.createHash("sha1").update(file).digest("hex");
        hashMap.set(path.relative(filepath, item.path), sha1);
    }
    return hashMap;
}

export async function zipDirectory(sourceDir, outPath) {
    const archive = archiver("zip");
    const writeStream = fs.createWriteStream(outPath);
    const readStream = archive.directory(sourceDir, "");
    await archive.finalize();
    await pipeline(readStream, writeStream);
}
