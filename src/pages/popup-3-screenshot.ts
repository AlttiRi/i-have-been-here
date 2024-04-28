import {JpgDataURL, logPicture, sleep}   from "../util.js";
import {captureVisibleTab, getActiveTab} from "../util-ext-bg.js";
import {TabCapture}      from "../bg/log-image.js";
import {ChangeIconPS, DownloadScreenshotSS, LogScreenshotSS, SaveScreenshotES} from "../message-center.js";
import {updateBottomHtml} from "./popup-4-bottom.js";


const addScreenshotBtn:      HTMLButtonElement = document.querySelector("#addScreenshotBtn")!; // todo rename to "save"
const downloadScreenshotBtn: HTMLButtonElement = document.querySelector("#downloadScreenshotBtn")!;
const restoreScreenshotBtn:  HTMLButtonElement = document.querySelector("#restoreScreenshotBtn")!;
const imageWrapElem:  HTMLDivElement    = document.querySelector("#image-wrap")!;
const imageElem:      HTMLImageElement  = document.querySelector("#image")!;


let tabCapture: TabCapture | null = null;
export async function updatePreview(): Promise<void> {
    const tab: chrome.tabs.Tab | undefined = await getActiveTab();
    if (!tab) {
        console.log("[warning] no active tab available");
        return;
    }
    console.log("tab to capture:", tab);

    if (tab.height && tab.width) {
        imageWrapElem.style.height = 320 / tab.width * tab.height + "px";
    }

    await updateBottomHtml(tab);

    const date: number = Date.now();
    const screenshotUrl: JpgDataURL | null = await captureVisibleTab();
    if (screenshotUrl === null) {
        console.log("screenShotData === null");
        return;
    }

    logPicture(screenshotUrl);
    imageElem.src = screenshotUrl;
    imageElem.alt = "";
    imageElem.dataset.tabUrl = tab.url || "";
    imageElem.dataset.date   = date.toString();
    addScreenshotBtn.removeAttribute("disabled");
    downloadScreenshotBtn.removeAttribute("disabled");

    tabCapture = {tab, screenshotUrl, date};

    // Firefox's popup's scrolls fix
    await sleep(20);
    imageElem.alt = ""; // don't remove it!
}

export async function initPreview(): Promise<void> {
    imageWrapElem.addEventListener("mousedown", async (event) => {
        if (event.buttons !== 1) {
            return;
        }
        await updatePreview();
        if (!tabCapture) {
            return;
        }
        LogScreenshotSS.send(tabCapture); // just to log the image in bg
    });

    downloadScreenshotBtn.addEventListener("click", async () => {
        if (!tabCapture) {
            return;
        }
        DownloadScreenshotSS.send(tabCapture);
        downloadScreenshotBtn.classList.add("btn-outline-success");
        ChangeIconPS.ping();
        await sleep(500);
        downloadScreenshotBtn.classList.remove("btn-outline-success");
    });

    addScreenshotBtn.addEventListener("click", async () => {
        if (!tabCapture) {
            return;
        }
        const response: string = await SaveScreenshotES.exchange(tabCapture);
        console.log("saveScreenshot response:", response);
        addScreenshotBtn.classList.add("btn-outline-success");
    });
}
