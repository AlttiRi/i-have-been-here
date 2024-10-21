import {downloadBlob, sleep} from "@alttiri/util-js";
import {Base64, fullUrlToFilename} from "@/util";
import {getFromStoreLocal, removeFromStoreLocal, setToStoreLocal} from "@/util-ext";
import {getScdId, toArrayBuffer, toStoreData} from "@/util-ext-image-data";
import {ScreenshotDataId, ScreenshotInfo, TabCapture} from "@/types";


// todo: rename + "Infos"
export async function getScreenshots(): Promise<ScreenshotInfo[]> {
    return await getFromStoreLocal("screenshots") || []; // todo make non undefined (set the default value on install)
}

export function getScreenshot(scd_id: ScreenshotDataId): Promise<Base64> {
    return getFromStoreLocal(scd_id);
}

export async function addScreenshot(tc: TabCapture): Promise<ScreenshotInfo> {
    const base64: Base64 = toStoreData(tc.screenshotUrl);
    const scd_id = await getScdId(base64);
    await setToStoreLocal(scd_id, base64);
    const sci: ScreenshotInfo = {
        title: tc.tab.title || "",
        url: tc.tab.url || "",
        created: tc.date,
        scd_id,
    };
    const screenshots: ScreenshotInfo[] = await getScreenshots();
    screenshots.push(sci);
    await setToStoreLocal("screenshots", screenshots);

    return sci;
}

export async function deleteScreenshots(): Promise<unknown> {
    const screenshots: ScreenshotInfo[] = await getScreenshots();
    const promises: Promise<unknown>[] = [];
    for (const screenshot of screenshots) {
        promises.push(removeFromStoreLocal(screenshot.scd_id));
    }
    return Promise.all(promises);
}


export async function exportScreenshots() {
    const screenshots: ScreenshotInfo[] = await getScreenshots();
    for (const screenshot of screenshots) {
        const base64 = await getScreenshot(screenshot.scd_id);
        const ab = toArrayBuffer(base64);
        const blob = new Blob([ab], {type: "image/jpeg"});
        const urlFilename = fullUrlToFilename(screenshot.url);
        const name = `[ihbh]${urlFilename}.jpg`;
        downloadBlob(blob, name, screenshot.url);
        await sleep(125);
    }
}
