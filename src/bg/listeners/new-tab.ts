import {queryTabs}             from "@/utils/util-ext";
import {TabCreatingOrFocusing} from "@/common/message-center";
import {LastActiveTabsQueue}   from "@/bg/classes/last-active-tabs-queue";
import {NewTabInfo} from "@/common/types";


export function initTabCreatingOrFocusing() {
    TabCreatingOrFocusing.addListener(focusOrCreateNewTab);
}

async function focusOrCreateNewTab({url, reload = false}: NewTabInfo): Promise<chrome.tabs.Tab | void> {
    console.log("focusOrCreateNewTab");
    const lastSelectedTab = await LastActiveTabsQueue.getLastActiveTabByUrl(url);
    return new Promise(resolve => {
        if (lastSelectedTab && lastSelectedTab.id) {
            chrome.tabs.update(lastSelectedTab.id, {
                active: true,
                url: reload ? url : undefined
            }, resolve);
        } else {
            chrome.tabs.create({url}, resolve);
        }
    });
}


// The simple implementation
async function focusOrCreateNewTabSimple(url: string, reload = false) {
    const tabs = await queryTabs({url, currentWindow: true});
    const activeTabId  = tabs.find(tab => tab.active)?.id;
    const lastTabId  = tabs[tabs.length - 1]?.id;
    const firstTabId = tabs[0]?.id;
    const tabId = activeTabId || lastTabId;

    if (tabId) {
        chrome.tabs.update(tabId, {
            active: true,
            url: reload ? url : undefined
        });
    } else {
        chrome.tabs.create({url});
    }
}
