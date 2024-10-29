import {getActiveTab}           from "@/util-ext-bg";
import {AddVisitGS, GetVisitGS} from "@/message-center";
import {addVisit, getVisit}     from "@/bg/shared/visits";
import {updateIconByTabId}      from "@/bg/tab-counter";
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
    console.log("addVisitForActiveTab");
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
    const visitJustWasCreated = visit.lastVisited === undefined;
    if (visitJustWasCreated) {
        void updateIconByTabId(tab.id!); // ts ! // todo for all tabs with same url
    }
    return visit;
}
