import {getTrimmedTitle} from "./popup-util.js";

const faviconElem: HTMLImageElement = document.querySelector("#faviconElem")!;
const titleElem: HTMLDivElement     = document.querySelector("#titleElem")!;
const urlElem:   HTMLDivElement     = document.querySelector("#urlElem")!;

export async function updateBottomHtml(tab: chrome.tabs.Tab): Promise<void> {
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
    urlElem.title = url;
}
