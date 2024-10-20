import {getActiveTab}           from "@/util-ext-bg";
import {addVisit, getVisit}     from "@/bg/store/visits";
import {updateIcons}            from "@/bg/tab-counter";
import {AddVisitGS, GetVisitGS} from "@/message-center";
import {Visit} from "@/types";

/** Init `Visit` message handlers */
export function initMH_Visit(): void {
    AddVisitGS.addListener(addVisitForActiveTab);
    GetVisitGS.addListener(getVisitForActiveTabIfExists); // todo?: for any url (not only active tab's url)
}


async function getVisitForActiveTabIfExists(): Promise<Visit | null> {
    const tab = await getActiveTab();
    if (!tab) {
        console.warn("[warning][getVisitForActiveTabIfExists] !tab");
        return null;
    }
    if (!tab.url) {
        console.warn("[warning][getVisitForActiveTabIfExists] !tab.url");
        return null;
    }

    return getVisit(tab.url);
}

async function addVisitForActiveTab(_data: undefined, sender: chrome.runtime.MessageSender): Promise<Visit | null> {
    const date = Date.now();
    const tab = await getActiveTab();
    if (tab === undefined) {
        console.warn("[warning][addVisitForActiveTab] tab === undefined", sender);
        return null;
    }
    if (tab.url === undefined) {
        console.warn("[warning][addVisitForActiveTab] tab.url === undefined", sender);
        return null;
    }

    const visit = await addVisit({
        url: tab.url,
        title: tab.title || "",
        date,
    });
    if (visit.lastVisited === undefined) { // if just was created
        updateIcons([tab]);
    }
    return visit;
}
