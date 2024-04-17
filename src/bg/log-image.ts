import {
    captureVisibleTab,
    exchangeMessageWithTab,
    executeScript,
    getActiveTab,
} from "../util-ext-bg.js";
import {logPicture, PngDataURL} from "../util.js";
import {setToStoreLocal} from "../util-ext.js";
import {toStoreData} from "./image-data.js";

export function logImageOnMessage(): void {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if (message === "take-screenshot--message-exchange") { // todo just use `chrome.runtime.sendMessage`
            void asyncHandler();
            sendResponse(); // Required
        } else
        if (message?.command === "save-screenshot--message-exchange"){
            const {dataUrl, tabUrl} = message;
            console.log("setToStoreLocal [\"save-screenshot\"]", dataUrl);
            void setToStoreLocal("screenshot:" + tabUrl, toStoreData(dataUrl))
                .then(() => {
                    console.log("screenshot is stored");
                    sendResponse(true);
                });
            return true;
        }
    });
}

export type TabData = {
    url:        string | undefined,
    title:      string | undefined,
    favIconUrl: string | undefined,
    id:     number | undefined,
    height: number | undefined,
    width:  number | undefined,
    date:   number,
    screenshotUrl: PngDataURL | null,
    incognito: boolean,
    tab: chrome.tabs.Tab,
};

export async function getActiveTabData(): Promise<TabData | null> {
    const date: number = Date.now();
    const tab: chrome.tabs.Tab | undefined = await getActiveTab();
    if (!tab) {
        console.log("[warning] no active tab available");
        return null;
    }
    console.log("Active tab:", tab);
    const {url, title, favIconUrl, id, incognito, height, width} = tab;
    const screenshotUrl = await captureVisibleTab({quality: 92});
    return {id, url, title, favIconUrl, screenshotUrl, date, incognito, height, width, tab};
}

async function asyncHandler() {
    const tabData: TabData | null = await getActiveTabData();
    if (tabData === null) {
        return;
    }

    if (tabData.screenshotUrl === null) {
        return;
    }

    // Log the picture in a background script //
    logPicture(tabData.screenshotUrl);

    // Log the picture in a tab //
    if (!tabData.id) {
        return;
    }
    const details: chrome.tabs.InjectDetails = {
        file: "/src/content/content--log-image.js",
    };
    const injected = await executeScript(details, tabData.tab);
    if (!injected) {
        return;
    }
    // Log the image in the web page console (send the message to the injected content script)
    const result = await exchangeMessageWithTab(tabData.id, {
        command: "log-screenshot--message-exchange",
        data: tabData.screenshotUrl
    });
    if (result === "[content script]: image logged") {
        console.log("Image was logged in the tab");
    }
}
