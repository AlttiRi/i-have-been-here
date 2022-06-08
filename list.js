import {getFromStoreLocal, removeFromStoreLocal} from "./util-ext.js";
import {createBackgroundTab} from "./util-ext-bg.js";

console.log(location);

void main();
async function main() {
    const app = document.querySelector("#app");
    const list = document.querySelector("#list");

    /** @type {Object} */
    const visited = await getFromStoreLocal("visited");
    for (const entry of Object.entries(visited)) {
        const item = createListItem(entry);
        list.append(item);
    }

    console.log("Store:", await getFromStoreLocal());

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


function createListItem([key, value]) {
    const elem = document.createElement("div");
    elem.innerHTML = `
        <h3><a href="${key}" rel="noreferrer noopener">${key}</a></h3>        
        <div>${value.map(dateFormatter).join("")}</div>
    `;
    elem.addEventListener("click", event => {
        event.preventDefault();
        createBackgroundTab(event.target.href);
    })
    return elem;
}
function dateFormatter(date) {
    return `<div>${date}</div>`
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
