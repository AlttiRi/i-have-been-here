import {getActiveTab, queryTabs} from "../util-ext-bg.js";
import {updateIcons} from "./tab-counter.js";
import {getFromStoreLocal, setToStoreLocal} from "../util-ext.js";
import {dateToDayDateString, downloadBlob, sleep} from "../util.js";


export async function visitedIconDataIfRequired(tab) {
    const visits = await getVisits();

    const visit = visits.find(visit => visit.url === tab.url);

    // todo: delete later;
    //  added since the old created visits have no title
    if (visit && (!visit.title || visit.url === visit.title || visit.url.slice(0, -1 /*remove slash*/) === visit.title)) {
        const tabId = tab.id;
        sleep(2000).then(async () => {
            const tab = (await queryTabs()).find(tab => tab.id === tabId);
            if (!tab) {
                return;
            }
            visit.title = tab.title;
            return setToStoreLocal("visits", visits);
        });
    }

    if (visit) {
        return {
            // imageData: emojiToImageData("✅"),
            path: chrome.runtime.getURL("images/mark.png")
        };
    }
    return null;
}

/** @return {Promise<Object[]>} */
export async function getVisits() {
    return await getFromStoreLocal("visits") || [];
}

export function initVisitBackgroundHandler() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message === "add-visit--message-exchange") {
            void addVisitHandler(sendResponse);
            return true;
        } else
        if (message === "get-visit--message-exchange") {
            void getVisitHandler(sendResponse);
            return true;
        }
    });
}


async function getVisitHandler(sendResponse) {
    const tab = await getActiveTab();
    if (!tab) {
        console.log("[warning] no active tab available");
        sendResponse(null);
        return;
    }

    const visits = await getVisits();
    const visit = visits.find(visit => visit.url === tab.url);
    sendResponse(visit);
}

async function addVisitHandler(sendResponse) {
    const date = Date.now();
    const tab = await getActiveTab();

    const visits = await getVisits();

    let visit = visits.find(visit => visit.url === tab.url);
    if (!visit) {
        visit = {
            url: tab.url,
            title: tab.title,
            date,
        };
        visits.push(visit);
        await setToStoreLocal("visits", visits);
        await updateIcons([tab]);
    } else {
        visit.date = [visit.date, date];
        await setToStoreLocal("visits", visits);
    }

    sendResponse(visit);
}

export async function exportVisits() {
    const visits = await getFromStoreLocal("visits") || "";
    const dateStr = dateToDayDateString(new Date());
    downloadBlob(new Blob([JSON.stringify(visits, null, " ")]), `[ihbh][${dateStr}] visits.json`);
}


// -------------------
// For migration from the old format run the follow code in the extension's console
// -------------------
// todo delete it later

async function migration(write = false) {
    await getFromStoreLocal();

    /** @type {[]} */
    const visited = await getFromStoreLocal("visited") || [];
    const visits = [];
    for (const [url, dates] of Object.entries(visited)) {
        let date = dates.map(date => Number(new Date(date.replaceAll(".", "-")/* FF fix */)));
        if (date.length === 1) {
            date = date[0];
        }
        const visit = {
            url, date
        }
        visits.push(visit);
    }
    console.log(visits);

    const dateStr = dateToDayDateString(new Date());
    download(new Blob([JSON.stringify(visited, null, " ")]), `[ihbh][${dateStr}] visited.json`);
    const _visits = visits.length === 0 ? await getFromStoreLocal("visits") : visits;
    download(new Blob([JSON.stringify(_visits, null, " ")]), `[ihbh][${dateStr}] visits.json`);

    if (write) {
        await setToStoreLocal("visits", visits);
        await removeFromStoreLocal("visited");
    }

    function getFromStoreLocal(key) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(key ? [key] : null, object => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError.message);
                }
                resolve(key ? object[key] : object);
            });
        });
    }
    function setToStoreLocal(key, value) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({[key]: value}, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError.message);
                }
                resolve();
            });
        });
    }
    function removeFromStoreLocal(key) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.remove([key], () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError.message);
                }
                resolve();
            });
        });
    }
    function dateToDayDateString(dateValue, utc = true) {
        const _date = new Date(dateValue);
        function pad(str) {
            return str.toString().padStart(2, "0");
        }
        const _utc = utc ? "UTC" : "";
        const year  = _date[`get${_utc}FullYear`]();
        const month = _date[`get${_utc}Month`]() + 1;
        const date  = _date[`get${_utc}Date`]();

        return year + "." + pad(month) + "." + pad(date);
    }
    function download(blob, name, url) {
        const anchor = document.createElement("a");
        anchor.setAttribute("download", name || "");
        const blobUrl = URL.createObjectURL(blob);
        anchor.href = blobUrl + (url ? ("#" + url) : "");
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
    }
}
// await migration();

async function importVitis(json) {
    const visits = JSON.parse(json);
    await setToStoreLocal("visits", visits);
    function setToStoreLocal(key, value) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({[key]: value}, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError.message);
                }
                resolve();
            });
        });
    }
}
// await importVitis(``);

