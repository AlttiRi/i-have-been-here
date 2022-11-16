import {exchangeMessage} from "./util-ext.js";

void main();
async function main() {
    const tabs = await exchangeMessage("get-tabs--message-exchange");
    console.log(globalThis.tabs = tabs);

    document.body.insertAdjacentHTML("afterbegin", `
        <div>
            <pre>${JSON.stringify(tabs, null, "   ")}</pre>
        </div>        
    `);
}
