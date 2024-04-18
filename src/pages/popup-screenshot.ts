import {downloadBlob, JpgDataURL, logPicture, sleep} from "../util.js";
import {exchangeMessage}                        from "../util-ext.js";
import {getScreenshotFilename, getTrimmedTitle} from "./popup-util.js";
import {captureVisibleTab, getActiveTab} from "../util-ext-bg.js";
import {TabCapture}                      from "../bg/log-image.js";


const saveButton:     HTMLButtonElement = document.querySelector("#btn-save-screen")!;
const downloadButton: HTMLButtonElement = document.querySelector("#btn-download-screenshot")!;
const imageWrapElem:  HTMLDivElement    = document.querySelector("#image-wrap")!;
const imageElem:   HTMLImageElement     = document.querySelector("#image")!;
const faviconElem: HTMLImageElement     = document.querySelector("#favicon")!;
const titleElem: HTMLDivElement         = document.querySelector("#title")!;
const urlElem:   HTMLDivElement         = document.querySelector("#url")!;


let tabCapture: TabCapture | null = null;
async function initPreview(): Promise<void> {
    const tab: chrome.tabs.Tab | undefined = await getActiveTab();
    if (!tab) {
        console.log("[warning] no active tab available");
        return;
    }
    console.log("tab to capture:", tab);

    if (tab.height && tab.width) {
        imageWrapElem.style.height = 320 / tab.width * tab.height + "px";
    }

    const {
        url = "", title = "", favIconUrl = "",
    } = tab;

    faviconElem.title = favIconUrl;
    if (!favIconUrl) {
        faviconElem.src = "/images/empty.png";
    } else
    if (favIconUrl.startsWith("data:")) {
        faviconElem.src = favIconUrl;
        faviconElem.title = favIconUrl.slice(0, 60) + (favIconUrl.length > 60 ? "…" : "");
    } else {
        faviconElem.src = "chrome://favicon/size/16@2x/" + url;
    }

    const trimmedTitle = await getTrimmedTitle(title, url);
    titleElem.textContent = trimmedTitle.length > 3 ? trimmedTitle : title;
    titleElem.title = titleElem.textContent;
    const u = new URL(url);
    if (u.protocol.startsWith("http")) {
        urlElem.textContent = u.host.replace(/^www./, "");
    } else {
        urlElem.textContent = u.href;
    }

    // urlElem.dataset.url = url;
    urlElem.title = url;

    const date: number = Date.now();
    const screenshotUrl: JpgDataURL | null = await captureVisibleTab();
    if (screenshotUrl === null) {
        console.log("screenShotData === null");
        return;
    }

    logPicture(screenshotUrl);
    imageElem.src = screenshotUrl;
    imageElem.alt = "";
    imageElem.dataset.tabUrl = url;
    imageElem.dataset.date   = date.toString();
    saveButton.removeAttribute("disabled");
    downloadButton.removeAttribute("disabled");

    tabCapture = {tab, screenshotUrl, date};

    // Tor's popup's scrolls fix
    await sleep(20);
    imageElem.alt = ""; // don't remove it!
}
void initPreview();


imageWrapElem.addEventListener("mousedown", async () => {
    await initPreview();
    if (!tabCapture) {
        return;
    }
    await exchangeMessage({
        command: "log-screenshot--message-exchange",
        data: tabCapture
    }); // just to log the image in bg
});

downloadButton.addEventListener("click", async () => {
    if (!tabCapture) {
        return;
    }

    chrome.runtime.sendMessage({
        command: "download-screenshot--message",
        data: tabCapture
    });

    downloadButton.classList.add("btn-outline-success");
    chrome.runtime.sendMessage("change-icon--message");
    await sleep(500);
    downloadButton.classList.remove("btn-outline-success");
});

saveButton.addEventListener("click", async () => {
    const dataUrl = imageElem.src;
    const tabUrl = imageElem.dataset.tabUrl;
    const response = await exchangeMessage({
        command: "save-screenshot--message-exchange",
        dataUrl,
        tabUrl,
    });
    console.log("save-screenshot--message-exchange response:", response);
    saveButton.classList.add("btn-outline-success");
});
