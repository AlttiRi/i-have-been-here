import {exchangeMessage}     from "/src/util-ext.js";
import {createBackgroundTab} from "/src/util-ext-bg.js";


const visitButton      = document.querySelector("#btn-visit");
const openVisitsButton = document.querySelector("#btn-open-visits");


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


function visitToButtonTitle(visit) {
    return [visit.date].flat().map(ms => new Date(ms)).join("\n");
}
