import {getActiveTabData, TabData} from "../bg/log-image.js";
import {downloadBlob, logPicture, sleep}        from "../util.js";
import {exchangeMessage}                        from "../util-ext.js";
import {getScreenshotFilename, getTrimmedTitle} from "./popup-util.js";


const saveButton:     HTMLButtonElement = document.querySelector("#btn-save-screen")!;
const downloadButton: HTMLButtonElement = document.querySelector("#btn-download-screenshot")!;
const imageElem:   HTMLImageElement     = document.querySelector("#image")!;
const faviconElem: HTMLImageElement     = document.querySelector("#favicon")!;
const titleElem: HTMLDivElement         = document.querySelector("#title")!;
const urlElem:   HTMLDivElement         = document.querySelector("#url")!;


let screenShotData: TabData | null = null;
async function initPreview() {
    screenShotData = await getActiveTabData();
    if (screenShotData === null) {
        return;
    }
    const {
        url = "", title = "", favIconUrl = "",
        screenshotUrl, date,
        /* id, incognito, height, width */
    } = screenShotData;

    faviconElem.title = favIconUrl;
    if (favIconUrl === undefined) {
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

    if (screenshotUrl) {
        logPicture(screenshotUrl);
        imageElem.src = screenshotUrl;
        imageElem.alt = "";
        imageElem.dataset.tabUrl = url;
        imageElem.dataset.date   = date.toString();
        saveButton.removeAttribute("disabled");
    }

    // Tor's popup's scrolls fix
    await sleep(20);
    imageElem.alt = ""; // don't remove it!
}
void initPreview();


imageElem.addEventListener("mousedown", async () => {
    await exchangeMessage("take-screenshot--message-exchange"); // just to log the image in bg
    await initPreview();
});

downloadButton.addEventListener("click", async () => {
    if (screenShotData === null) {
        return;
    }
    const {
        url = "", title = "",
        screenshotUrl,
    } = screenShotData;
    if (!screenshotUrl) {
        return;
    }

    const resp = await fetch(screenshotUrl);
    const blob = await resp.blob();

    const name = await getScreenshotFilename(url, title);
    downloadBlob(blob, name, url);

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
