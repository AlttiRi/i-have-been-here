import {getActiveTab, queryTabs} from "../util-ext-bg.js";
import {updateIcons} from "./tab-counter.js";
import {getFromStoreLocal, setToStoreLocal, SendResponse} from "../util-ext.js";
import {dateToDayDateString, downloadBlob, sleep} from "../util.js";


export type Visit = {
    url:   string,
    title: string,
    date:  number | number[],
};

export async function getVisits(): Promise<Visit[]> {
    return await getFromStoreLocal("visits") || [];
}

export async function visitedIconDataIfRequired(tab: chrome.tabs.Tab) {
    const visits: Visit[] = await getVisits();
    const visit: Visit | undefined = visits.find(visit => visit.url === tab.url);

    // todo: delete later;
    //  added since the old created visits have no title
    if (visit && (!visit.title || visit.url === visit.title || visit.url.slice(0, -1 /*remove slash*/) === visit.title)) {
        const tabId = tab.id;
        sleep(2000).then(async () => {
            const tab = (await queryTabs()).find(tab => tab.id === tabId);
            if (!tab) {
                return;
            }
            visit.title = tab.title || "";
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

export async function updateVisit(newVisit: Visit): Promise<void> {
    const visits = await getVisits();
    const visit: Visit | undefined = visits.find(visit => visit.url === newVisit.url);
    if (visit === undefined) {
        console.warn("[warning][updateVisit] visit === undefined");
        return;
    }
    const keys = Object.keys(visit) as Array<keyof Visit>;
    keys.forEach(key => delete visit[key]);
    Object.assign(visit, newVisit);
    await setToStoreLocal("visits", visits);
}


export function initVisitBackgroundHandler(): void {
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



async function getVisitHandler(sendResponse: SendResponse): Promise<void> {
    const tab = await getActiveTab();
    if (!tab) {
        console.warn("[warning][getVisitHandler] no active tab available");
        sendResponse(null);
        return;
    }

    const visits = await getVisits();
    const visit = visits.find(visit => visit.url === tab.url);
    sendResponse(visit);
}

async function addVisitHandler(sendResponse: SendResponse): Promise<void> {
    const date = Date.now();
    const tab = await getActiveTab();
    if (tab === undefined) {
        console.warn("[warning][addVisitHandler] tab === undefined");
        sendResponse(null); // todo recheck receiver
        return;
    }
    if (tab.url === undefined) {
        console.warn("[warning][addVisitHandler] tab.url === undefined");
        sendResponse(null); // todo recheck receiver
        return;
    }

    const visits = await getVisits();

    let visit: Visit | undefined = visits.find(visit => visit.url === tab.url);
    if (visit === undefined) {
        visit = {
            url: tab.url,
            title: tab.title || "",
            date,
        };
        visits.push(visit);
        await setToStoreLocal("visits", visits);
        updateIcons([tab]);
    } else {
        visit.date = [visit.date, date].flat();
        await setToStoreLocal("visits", visits);
    }

    sendResponse(visit);
}

export async function exportVisits(): Promise<void> {
    const visits = await getFromStoreLocal("visits") || "";
    const dateStr = dateToDayDateString(new Date());
    downloadBlob(new Blob([JSON.stringify(visits, null, " ")]), `[ihbh][${dateStr}] visits.json`);
}

export async function importVisits(visits: Visit[]): Promise<void> {
    await setToStoreLocal("visits", visits);
}
