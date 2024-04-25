import {getFromStoreLocal, removeFromStoreLocal}  from "../util-ext.js";
import {createBackgroundTab}                      from "../util-ext-bg.js";
import {exportVisits, getVisits, importVisits}    from "../bg/visits.js";
import {toArrayBuffer, toJpgDataUrl} from "../bg/image-data.js";
import {dateToDayDateTimeString, downloadBlob, fullUrlToFilename, sleep} from "../util.js";
import {ScreenshotInfo, Visit}       from "../types.js";

console.log(location);

// todo reverse order
//  merge

void main();
async function main() {

    // ----

    const exportVisitsButton: HTMLButtonElement = document.querySelector("#export-visits")!;
    exportVisitsButton.addEventListener("click", async () => {
        await exportVisits();
    });

    const importVisitsButton: HTMLInputElement = document.querySelector("input[type=file]")!;
    importVisitsButton.addEventListener("change", async () => {
        const file: File = importVisitsButton.files![0];
        console.log(file);
        const array = JSON.parse(await file.text());
        await importVisits(array);
    });

    const exportImagesButton: HTMLButtonElement = document.querySelector("#export-images")!;
    exportImagesButton.addEventListener("click", exportImages);

    const deleteImagesButton: HTMLButtonElement = document.querySelector("#delete-images")!;
    deleteImagesButton.addEventListener("click", async () => {
        deleteImagesButton.setAttribute("disabled", "");
        await removeImages();
        deleteImagesButton.removeAttribute("disabled");
    });

    // ----

    const list: HTMLDivElement = document.querySelector("#list")!;

    const visits: Visit[] = await getVisits();
    console.log("Visits:", visits);
    for (const visit of visits) {
        const item = createListItem(visit);
        list.append(item);
    }
    function createListItem(visit: Visit): HTMLDivElement {
        const elem: HTMLDivElement = document.createElement("div");
        elem.classList.add("visit");
        elem.classList.add("mb-3");
        elem.id = visit.url;
        elem.innerHTML = `
            <h4 class="title">${visit.title || ""}</h4> 
            <h5><a href="${visit.url}" rel="noreferrer noopener" title="${visit.title || ""}">${visit.url}</a></h5>
            <div title="created">${dateFormatter(visit.created)}</div>
            <i title="last visited time">${visit.lastVisited ? dateFormatter(visit.lastVisited) : ""}</i>
        `.trim();
        const a: HTMLAnchorElement = elem.querySelector("a")!;
        a.addEventListener("click", event => {
            event.preventDefault();
            createBackgroundTab(a.href);
        });
        const titleElem: HTMLHeadingElement = elem.querySelector(".title")!;
        titleElem.addEventListener("click", event => {
            event.preventDefault();
            if (event.ctrlKey) {
                location.hash = elem.id;
            }
        });
        return elem;
    }

    // ----

    const screenshots: ScreenshotInfo[] = await getFromStoreLocal("screenshots") || [];
    console.log("Screenshots:", screenshots);
    const div = document.createElement("div");
    div.classList.add("screenshots");
    document.body.append(div);
    for (const screenshot of screenshots) {
        div.append(await createImageItem(screenshot));
    }
    async function createImageItem(screenshots: ScreenshotInfo): Promise<HTMLDivElement> {

        const {url, created, title, scd_id} = screenshots;
        const base64 = await getFromStoreLocal(scd_id);
        const src = toJpgDataUrl(base64);

        const div = document.createElement("div");
        div.classList.add("screenshot-info");
        div.dataset.hash = scd_id;
        div.dataset.created = created.toString();
        div.insertAdjacentHTML("afterbegin", `
            <h3 class="title" style="align-self: start; margin: 12px;">${title || fullUrlToFilename(url)}</h3>
            <div class="url"  style="align-self: start; margin: 12px;">${url}</div>
            <div class="created" style="align-self: start; margin: 12px;">${created? dateFormatter(created) : ""}</div>
            <img src="${src}" alt="${title}" title="${fullUrlToFilename(url)}">
        `);

        return div;
    }

    // ----

    ;(function scrollToHash() {
        const hash = location.hash;
        if (!hash) {
            return;
        }
        location.hash = "";
        location.hash = hash;
    })();
    const controls: HTMLDivElement = document.querySelector("#controls")!;
    controls.addEventListener("click", event => {
        if (event.ctrlKey) {
            location.hash = "";
        }
    });

    // ----

}

type HTMLString = string;
function dateFormatter(date: number | string | Date): HTMLString {
    return `<div>${dateToDayDateTimeString(date, false)}</div>`;
}

async function removeImages(): Promise<void> {
    const screenshots: ScreenshotInfo[] = await getFromStoreLocal("screenshots") || [];
    const promises: Promise<unknown>[] = [];
    for (const screenshot of screenshots) {
        promises.push(removeFromStoreLocal(screenshot.scd_id));
    }
    await Promise.all(promises);
}

async function exportImages() {
    const screenshots: ScreenshotInfo[] = await getFromStoreLocal("screenshots") || [];
    for (const screenshot of screenshots) {
        const base64 = await getFromStoreLocal(screenshot.scd_id);
        const ab = toArrayBuffer(base64);
        const blob = new Blob([ab], {type: "image/jpeg"});
        const urlFilename = fullUrlToFilename(screenshot.url);
        const name = `[ihbh]${urlFilename}.jpg`;
        downloadBlob(blob, name, screenshot.url);
        await sleep(125);
        console.log(name, screenshot.url);
    }

}
