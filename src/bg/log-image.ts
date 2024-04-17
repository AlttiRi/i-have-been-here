import {
    exchangeMessageWithTab,
    executeScript,
} from "../util-ext-bg.js";
import {logPicture, JpgDataURL} from "../util.js";
import {SendResponse, setToStoreLocal} from "../util-ext.js";
import {toStoreData} from "./image-data.js";

export function logImageOnMessage(): void {
    function logImageOnMessageListener(message: any, _sender: chrome.runtime.MessageSender, sendResponse: SendResponse) {
        if (message?.command === "log-screenshot--message-exchange") { // todo just use `chrome.runtime.sendMessage`
            void asyncHandler(message.data);
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
    }
    chrome.runtime.onMessage.addListener(logImageOnMessageListener);
}

export type TabCapture = {
    tab: chrome.tabs.Tab,
    screenshotUrl: JpgDataURL,
    date: number,
};

async function asyncHandler(tabData: TabCapture) {
    const {tab, screenshotUrl} = tabData;

    // Log the picture in a background script //
    logPicture(screenshotUrl);

    // Log the picture in a tab //
    if (!tab.id) {
        return;
    }
    const details: chrome.tabs.InjectDetails = {
        file: "/src/content/content--log-image.js",
    };
    const injected: boolean = await executeScript(details, tab);
    if (!injected) {
        return;
    }
    // Log the image in the web page console (send the message to the injected content script)
    const result = await exchangeMessageWithTab(tab.id, {
        command: "log-screenshot--message-exchange",
        data: tabData.screenshotUrl
    });
    if (result === "[content script]: image logged") {
        console.log("Image was logged in the tab");
    }
}
