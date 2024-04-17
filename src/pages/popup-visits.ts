import {exchangeMessage}     from "../util-ext.js";
import {createBackgroundTab} from "../util-ext-bg.js";
import {Visit} from "../bg/visits";


const visitButton:      HTMLButtonElement = document.querySelector("#btn-visit")!;
const openVisitsButton: HTMLButtonElement = document.querySelector("#btn-open-visits")!;


visitButton.addEventListener("click", async () => {
    const visit = await exchangeMessage("add-visit--message-exchange");
    visitButton.classList.add("btn-outline-success");
    visitButton.title = visitToButtonTitle(visit);
});

openVisitsButton.addEventListener("click", async () => {
    createBackgroundTab(chrome.runtime.getURL("/src/pages/visits.html"));
});


;(async function() {
    const visit = await exchangeMessage("get-visit--message-exchange");
    if (visit) {
        visitButton.classList.add("btn-outline-success");
        visitButton.title = visitToButtonTitle(visit);
    }
})();


function visitToButtonTitle(visit: Visit): string {
    return [visit.date].flat().map(ms => new Date(ms)).join("\n");
}
