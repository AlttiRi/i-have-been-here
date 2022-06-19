import {getFromStoreLocal, removeFromStoreLocal, setToStoreLocal} from "./util-ext.js";
import {createBackgroundTab} from "./util-ext-bg.js";
import {exportVisits, getVisits, updateVisit} from "./bg/visits.js";
import {
    dateToDayDateString,
    downloadBlob,
    fullUrlToFilename,
    sleep
} from "./util.js";
import {toArrayBuffer, toDataUrl} from "./bg/image-data.js";

console.log(location);

// todo reverse order
//  merge

void main();
async function main() {
    const controls = document.querySelector("#controls");
    const list = document.querySelector("#list");

    controls.addEventListener("click", event => {
        event.preventDefault();
        if (event.ctrlKey) {
            location.hash = "";
        }
    });

    const exportVisitsButton = document.querySelector("#export-visits");
    exportVisitsButton.addEventListener("click", () => {
        void exportVisits();
    });
    const importVisitsButton = document.querySelector("input[type=file]");
    importVisitsButton.addEventListener("change", async () => {
        const file = importVisitsButton.files[0];
        console.log(file);
        const array = JSON.parse(await file.text());
        await setToStoreLocal("visits", array);
    });

    /** @return {Object[]} */
    const visits = await getVisits();
    for (const visit of visits) {
        const item = createListItem(visit);
        list.append(item);
    }

    console.log("Visits:", await getFromStoreLocal("visits"));

    const imageEntries = await getImageEntries();
    for (const [key, /** @type {string}*/ data] of imageEntries) {

        const url = key.substring("screenshot:".length);
        console.log("data.length", url, data.length);

        const imgElem = document.createElement("img");
        imgElem.src = toDataUrl(data);
        document.body.append(imgElem);

        const h2 = document.createElement("h2");
        h2.setAttribute("style", `align-self: start; margin: 12px`);
        h2.textContent = url;
        imgElem.before(h2);

        const div = document.createElement("div");
        div.setAttribute("style", `align-self: start; margin: 12px`);
        div.textContent = (fullUrlToFilename(url));
        imgElem.before(div);

    }
    console.log("screenshots:", imageEntries);



    const exportImagesButton = document.querySelector("#export-images");
    exportImagesButton.addEventListener("click", async () => {
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

    const deleteImagesButton = document.querySelector("#delete-images");
    deleteImagesButton.addEventListener("click", async () => {
        deleteImagesButton.setAttribute("disabled", "");
        const promises = []
        for (const [key, /** @type {string}*/ data] of imageEntries) {
            promises.push(removeFromStoreLocal(key));
        }
        await Promise.all(promises);
        deleteImagesButton.removeAttribute("disabled");
    });

    function scrollToHash() {
        const hash = location.hash;
        if (!hash) {
            return;
        }
        location.hash = "";
        location.hash = hash;
    }
    scrollToHash();
}


function createListItem(visit) {
    const elem = document.createElement("div");
    elem.classList.add("visit");
    elem.classList.add("mb-3");
    elem.id = visit.url;
    elem.innerHTML = `
        <h4 class="title">${visit.title || ""}</h4> 
        <h5><a href="${visit.url}" rel="noreferrer noopener" title="${visit.title || ""}">${visit.url}</a></h5>      
         
        <div>${[visit.date].flat().map(dateFormatter).join("")}</div>
    `;
    elem.querySelector("a").addEventListener("click", event => {
        event.preventDefault();
        createBackgroundTab(event.target.href);
    });
    const titleElem = elem.querySelector(".title");
    titleElem.addEventListener("dblclick", async (event) => {
        event.preventDefault();
        console.log("dblclick");
        delete visit.title;
        await updateVisit(visit);
        titleElem.textContent = "";
    });
    titleElem.addEventListener("click", event => {
        event.preventDefault();
        if (event.ctrlKey) {
            location.hash = elem.id;
        }
    });
    return elem;
}
function dateFormatter(date) {
    return `<div>${dateToDayDateString(new Date(date))}</div>`;
}

async function getImageEntries() {
    return Object.entries(await getFromStoreLocal()).filter(([key, value]) => {
        return key.startsWith("screenshot:");
    });
}
async function removeImages() {
    const imageEntries = await getImageEntries()
    for (const [url, /** @type {string}*/ data] of imageEntries) {
        console.log("remove:", url, data);
        await removeFromStoreLocal(url);
    }
}
