import {getFromStoreLocal, removeFromStoreLocal}            from "../util-ext.js";
import {createBackgroundTab}                                from "../util-ext-bg.js";
import {exportVisits, getVisits, importVisits, updateVisit, Visit} from "../bg/visits.js";
import {toArrayBuffer, toDataUrl}                           from "../bg/image-data.js";
import {DataURL, dateToDayDateString, downloadBlob, fullUrlToFilename, sleep} from "../util.js";

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
    exportImagesButton.addEventListener("click", async () => {
        const imageEntries = await getImageEntries();
        for (const [key, /** @type {string}*/ data] of imageEntries) {
            const ab = toArrayBuffer(data);
            const blob = new Blob([ab], {type: "image/jpeg"});
            const url = key.slice("screenshot:".length);
            const urlFilename = fullUrlToFilename(url);
            const name = `[ihbh]${urlFilename}.jpg`;
            downloadBlob(blob, name, url);
            await sleep(125);
            console.log(name, url);
        }
    });

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
            <div>${[visit.date].flat().map(dateFormatter).join("")}</div>
        `.trim();
        const a: HTMLAnchorElement = elem.querySelector("a")!;
        a.addEventListener("click", event => {
            event.preventDefault();
            createBackgroundTab(a.href);
        });
        const titleElem: HTMLHeadingElement = elem.querySelector(".title")!;
        // titleElem.addEventListener("dblclick", async function deleteTitle(event)  { // todo remove
        //     event.preventDefault();
        //     console.log("dblclick");
        //     delete visit.title;
        //     await updateVisit(visit);
        //     titleElem.textContent = "";
        // });
        titleElem.addEventListener("click", event => {
            event.preventDefault();
            if (event.ctrlKey) {
                location.hash = elem.id;
            }
        });
        return elem;
    }

    // ----

    const imageEntries: Array<[string, DataURL]> = await getImageEntries();
    console.log("Screenshots:", imageEntries);
    for (const [key, data] of imageEntries) {
        document.body.append(createImageItem(key, data));
    }
    function createImageItem(key: string, data: DataURL): HTMLDivElement {
        const url = key.slice("screenshot:".length);
        console.log("data.length", url, data.length);

        const item = document.createElement("div");

        const imgElem = document.createElement("img");
        imgElem.src = toDataUrl(data);
        item.append(imgElem);

        const h2 = document.createElement("h2");
        h2.setAttribute("style", `align-self: start; margin: 12px`);
        h2.textContent = url;
        imgElem.before(h2);

        const div = document.createElement("div");
        div.setAttribute("style", `align-self: start; margin: 12px`);
        div.textContent = fullUrlToFilename(url);
        imgElem.before(div);

        return item;
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
    return `<div>${dateToDayDateString(new Date(date))}</div>`;
}

async function getImageEntries(): Promise<Array<[string, DataURL]>> {
    return Object.entries(await getFromStoreLocal())
        .filter(([key, value]) => {
            return key.startsWith("screenshot:");
        }) as Array<[string, DataURL]>;
}

async function removeImages(): Promise<void> {
    const imageEntries: Array<[string, DataURL]> = await getImageEntries();
    const promises = [];
    for (const [key, data] of imageEntries) {
        // const url = key.slice("screenshot:".length);
        // console.log("remove:", url, data);
        promises.push(removeFromStoreLocal(key));
    }
    await Promise.all(promises);
}
