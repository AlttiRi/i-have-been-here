import {getFromStoreLocal, removeFromStoreLocal, setToStoreLocal} from "./util-ext.js";
import {createBackgroundTab} from "./util-ext-bg.js";
import {exportVisits, getVisits, updateVisit} from "./bg/visits.js";
import {dateToDayDateString} from "./util.js";

console.log(location);

void main();
async function main() {
    const app = document.querySelector("#app");
    const list = document.querySelector("#list");
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

    // await removeImages();

    const imageEntries = await getImageEntries();
    for (const [key, /** @type {string}*/ data] of imageEntries) {

        const url = key.substring("screenshot:".length);
        console.log("data.length", url, data.length);

        const imgElem = document.createElement("img");
        const decoded = btoa(data);
        imgElem.src = "data:image/jpeg;base64," + decoded;
        document.body.append(imgElem);

        const div = document.createElement("h2");
        div.setAttribute("style", `align-self: start; margin: 12px`);
        div.textContent = url;
        imgElem.before(div);
    }
    console.log("screenshots:", imageEntries);
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
