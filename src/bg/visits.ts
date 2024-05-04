import {getActiveTab} from "@/src/util-ext-bg";
import {updateIcons} from "@/src/bg/tab-counter";
import {getFromStoreLocal, setToStoreLocal} from "@/src/util-ext";
import {dateToDayDateString, downloadBlob} from "@/src/util";
import {AddVisitGS, GetVisitGS} from "@/src/message-center";
import {Visit} from "@/src/types";



export async function getVisits(): Promise<Visit[]> {
    return await getFromStoreLocal("visits") || [];
}

export async function visitedIconDataIfRequired(tab: chrome.tabs.Tab) {
    const visits: Visit[] = await getVisits();
    const visit: Visit | undefined = visits.find(visit => visit.url === tab.url);

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
    AddVisitGS.addListener(addVisitHandler);
    GetVisitGS.addListener(getVisitHandler);
}



async function getVisitHandler(): Promise<Visit | null> {
    const tab = await getActiveTab();
    if (!tab) {
        console.warn("[warning][getVisitHandler] no active tab available");
        return null;
    }

    const visits = await getVisits();
    const visit = visits.find(visit => visit.url === tab.url);
    return visit || null;
}

async function addVisitHandler(_data: undefined, sender: chrome.runtime.MessageSender): Promise<Visit | null> {
    const date = Date.now();
    const tab = await getActiveTab();
    if (tab === undefined) {
        console.warn("[warning][addVisitHandler] tab === undefined", sender);
        return null;
    }
    if (tab.url === undefined) {
        console.warn("[warning][addVisitHandler] tab.url === undefined", sender);
        return null;
    }

    const visits = await getVisits();

    let visit: Visit | undefined = visits.find(visit => visit.url === tab.url);
    if (visit === undefined) {
        visit = {
            url: tab.url,
            title: tab.title || "",
            created: date,
        };
        visits.push(visit);
        await setToStoreLocal("visits", visits);
        updateIcons([tab]);
    } else {
        visit.lastVisited = date;
        await setToStoreLocal("visits", visits);
    }

    return visit;
}

export async function exportVisits(): Promise<void> {
    const visits = await getFromStoreLocal("visits") || [];
    const dateStr = dateToDayDateString(new Date(), false);
    downloadBlob(new Blob([JSON.stringify(visits, null, " ")]), `[ihbh][${dateStr}] visits.json`);
}

export async function importVisits(visits: Visit[]): Promise<void> {
    await setToStoreLocal("visits", visits);
}
