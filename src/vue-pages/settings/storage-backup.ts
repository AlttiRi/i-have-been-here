import {downloadBlob} from "@alttiri/util-js";
import {logOrange} from "@/utils/util";

/** To export the entire `chrome.storage.local`. */
export function exportStore(browserName = "") {
    return new Promise<void>(resolve => {
        chrome.storage.local.get(o => {
            const text = JSON.stringify(o, null, 2);
            const browser = browserName ? `[${browserName}] ` : "";
            downloadBlob(new Blob([text]), `[ihbh] full export ${browser}${Date.now()}.json`);
            resolve();
        });
    });
}

/**
 * To wipe the entire `chrome.storage.local`.
 * Use after `exportStore` and before `importStore`.
 */
export function wipeStore() {
    return new Promise<void>(async (resolve) => {
        const promises: Promise<void>[] = [];
        chrome.storage.local.get(null, obj => {
            for (const key of Object.keys(obj)) {
                promises.push(new Promise<void>(resolve => {
                    chrome.storage.local.remove(key, resolve);
                }));
            }
        });
        await Promise.all(promises);
        resolve();
    });
}

/** To import the entire `chrome.storage.local`. */
export function importStore() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.style.display = "none";
    document.body.prepend(input);
    input.addEventListener("change", async event => {
        // @ts-ignore
        const json = JSON.parse(await input.files[0].text());

        if (Array.isArray(json) || typeof json !== "object") {
            logOrange("[importStore] json is not an object")();
            return;
        }
        if (!("version" in json)) { // todo: remove later
            json.version = 1;
        }

        if (json.__json_name !== "ihbh-extension-storage") {
            logOrange(`Missed or wrong "__json_name" mark property`)();
            const response = confirm(`Missed or wrong "__json_name" mark property. Import?`);
            if (!response) {
                return;
            }
        }

        console.log("json", json);
        // @ts-ignore
        globalThis.json = json;
        chrome.storage.local.set(json, () => {
            chrome.runtime.reload();
        });
    });
    input.click();
}
