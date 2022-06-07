import {getFromStoreLocal} from "./util-ext.js";
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
