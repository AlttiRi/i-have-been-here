import {getActiveTab}           from "@/utils/util-ext";
import {VisitCreating, VisitGetting} from "@/common/message-center";
import {addVisit, getVisit}     from "@/common/data/visits-ex";
import {updateIconBy}           from "@/bg/inits/badges-icons";
import {Visit} from "@/common/types";


export function initVisitListeners(): void {
    VisitCreating.addListener(addVisitForActiveTab);
    VisitGetting.addListener(getVisitForActiveTabIfExists); // todo?: for any url (not only active tab's url)
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

async function addVisitForActiveTab(_data: void, sender: chrome.runtime.MessageSender): Promise<Visit | null> {
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
        void updateIconBy({url: tab.url});
    }
    return visit;
}
