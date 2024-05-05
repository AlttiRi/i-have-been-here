import fs   from "node:fs";
import path from "node:path";
import * as fflate from "fflate";
import {listFiles} from "@alttiri/util-node-js";


class Zip {
    buffers = [];
    constructor() {
        this.zip = new fflate.Zip((err, data, final) => {
            err && console.error(err, data, final);
            this.buffers.push(data);
        });
    }
    async add({data, filename, mtime, level}) {
        let zipDeflate;
        if (level === undefined) {
            zipDeflate = new fflate.ZipPassThrough(filename);
        } else {
            zipDeflate = new fflate.ZipDeflate(filename, {level});
        }
        zipDeflate.mtime = mtime;

        if (typeof data === "string" || data instanceof String) {
            data = new TextEncoder().encode(data);
        } else
        if (data instanceof Blob) {
            data = await Zip.blobToUi8Array(data);
        }

        this.zip.add(zipDeflate);
        zipDeflate.push(data, true);
    }

    /** @returns {Blob} */
    blob() {
        this.zip.end();
        return new Blob(this.buffers);
    }
    /** @returns {Promise<Uint8Array>} */
    ui8Array() {
        return Zip.blobToUi8Array(this.blob());
    }

    /** @param {Blob} blob
     *  @return {Promise<Uint8Array>}  */
    static async blobToUi8Array(blob) {
        const ab = await blob.arrayBuffer();
        return new Uint8Array(ab);
    }
}

/**
 * @example
 * ```js
 * await zipFolder("./dist-bundle", "result.zip");
 * ```
 */
export async function zipFolder(folderPath, resultZipPath) {
    const zip = new Zip();
    for await (const item of listFiles({filepath: folderPath})) {
        const relFilepath = path.relative(folderPath, item.path);
        if ("stats" in item) {
            await zip.add({
                filename: relFilepath,
                mtime: item.stats.mtime,
                data: fs.readFileSync(item.path),
                // level: 9,
            });
            // console.log(relFilepath);
        }
    }
    const wsZip = fs.createWriteStream(resultZipPath);
    const ui8a = await zip.ui8Array();
    await new Promise((resolve, reject) => {
        wsZip.write(ui8a, error => {
            if (error) {
                reject(error);
            }
            resolve();
        });
    });
    return ui8a;
}

