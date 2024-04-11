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

export async function updateVisit(updatedVisit) {
    const visits = await getVisits();
    const visit = visits.find(visit => visit.url === updatedVisit.url);
    Object.keys(visit).forEach(key => delete visit[key]);
    Object.assign(visit, updatedVisit);
    await setToStoreLocal("visits", visits);
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
        visit.date = [visit.date, date].flat();
        await setToStoreLocal("visits", visits);
    }

    sendResponse(visit);
}

export async function exportVisits() {
    const visits = await getFromStoreLocal("visits") || "";
    const dateStr = dateToDayDateString(new Date());
    downloadBlob(new Blob([JSON.stringify(visits, null, " ")]), `[ihbh][${dateStr}] visits.json`);
}

export async function importVitis(visits) {
    await setToStoreLocal("visits", visits);
}
