import {getFromStoreLocal, removeFromStoreLocal} from "./util-ext.js";
import {createBackgroundTab} from "./util-ext-bg.js";
import {getVisits} from "./bg/visits.js";

console.log(location);

void main();
async function main() {
    const app = document.querySelector("#app");
    const list = document.querySelector("#list");

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
    elem.innerHTML = `
        <h3><a href="${visit.url}" rel="noreferrer noopener" title="${visit.title || ""}">${visit.url}</a></h3>        
        <div>${[visit.date].flat().map(dateFormatter).join("")}</div>
    `;
    elem.querySelector("h3").addEventListener("click", event => {
        event.preventDefault();
        createBackgroundTab(event.target.href);
    })
    return elem;
}
function dateFormatter(date) {
    return `<div>${new Date(date)}</div>`;
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
