import {getFromStoreLocal, removeFromStoreLocal, setToStoreLocal} from "@/src/util-ext";
import {ScreenshotInfo, StoreLocalBase, URLString, Visit} from "@/src/types";
import {Base64} from "@/src/util";
import {getScdId} from "@/src/bg/image-data";

const lastStoreVersion = 2;

chrome.runtime.onInstalled.addListener(function setInitialVersion(details: chrome.runtime.InstalledDetails) {
    console.log("chrome.runtime.onInstalled", details.reason);
    if (details.reason === "install") {
        void setToStoreLocal("version", lastStoreVersion);
    }
});
chrome.runtime.onStartup.addListener(function () {
    console.log("chrome.runtime.onStartup");
});

export async function updateStoreModel(): Promise<void> {
    let version: number = await getFromStoreLocal("version") || 1;
    if (version === lastStoreVersion) {
        console.log("Store is up to date");
        return;
    }

    if (version === 1) {
        type ScreenshotDataId_V1 = `screenshot:${URLString}`;
        type ScreenshotEntry_V1 = [ScreenshotDataId_V1, Base64];
        type StoreLocalModel_V1 = {
            [sc_id: ScreenshotDataId_V1]: Base64,
            visits: Visit_V1[],
        } & StoreLocalBase;
        type Visit_V1 = {
            url:    string,
            title?: string,
            date:   number | number[],
        };

        const isScreenshotEntry_V1 = function(entry: [string, unknown]): entry is ScreenshotEntry_V1 {
            return entry[0].startsWith(`screenshot:`);
        }
        const getScreenshotEntries_V1 = async function(): Promise<ScreenshotEntry_V1[]>  {
            return Object.entries(await getFromStoreLocal()).filter(isScreenshotEntry_V1);
        }

        await (async function updateVisits() {
            // @ts-ignore
            const visits: Visit_V1[] = await getFromStoreLocal("visits") || [];
            const newVisits: Visit[] = [];
            for (const visit of visits) {
                const newVisit: Visit = {
                    url: visit.url,
                    title: visit.title || "",
                    created: Array.isArray(visit.date) ? visit.date[0] : visit.date,
                };
                if (Array.isArray(visit.date)) {
                    newVisit.lastVisited = visit.date[visit.date.length - 1];
                }
                newVisits.push(newVisit);
            }
            await setToStoreLocal("visits", newVisits);
        })();

        await (async function updateScreenshots() {
            const entries: ScreenshotEntry_V1[] = await getScreenshotEntries_V1();

            const screenshots: ScreenshotInfo[] = [];
            const prefixLength_v1 = "screenshot:".length;
            for (const [scd_id_v1, base64] of entries) {
                const url: URLString = scd_id_v1.slice(prefixLength_v1);
                const scd_id = await getScdId(base64);
                screenshots.push({
                    scd_id,
                    url,
                    title: "",
                    created: 0,
                });
                // @ts-ignore
                await removeFromStoreLocal(scd_id_v1);
                await setToStoreLocal(scd_id, base64);
            }
            await setToStoreLocal("screenshots", screenshots);
        })();

        version = 2;
        await setToStoreLocal("version", version);
        console.log(`Store was updated to version ${version}`);
    }
}


/*
// full export
chrome.storage.local.get(o => {
    const text = JSON.stringify(o, null, 2);
    // @ts-ignore
    downloadBlob(new Blob([text]), `[ihbh] full export ${Date.now()}.json`);
    // @ts-ignore
    function downloadBlob(blob, name, url) {
        const anchor = document.createElement("a");
        anchor.setAttribute("download", name || "");
        const blobUrl = URL.createObjectURL(blob);
        anchor.href = blobUrl + (url ? ("#" + url) : "");
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    }
});

// to wipe storage (before full import)
chrome.storage.local.get(null, obj => {
    Object.keys(obj).forEach(key => {
        chrome.storage.local.remove(key);
    });
});

// to import the full export
const input = document.createElement("input");
input.type = "file";
input.accept = "application/json";
document.body.prepend(input);
input.addEventListener("change", async event => {
    // @ts-ignore
    const json = JSON.parse(await input.files[0].text());
    if (!("version" in json)) {
        json.version = 1;
    }

    console.log("json", json);
    // @ts-ignore
    globalThis.json = json;
    chrome.storage.local.set(json, () => {
        chrome.runtime.reload();
    });
});

 */


