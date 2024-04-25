import {createBackgroundTab} from "../util-ext-bg.js";
import {AddVisitGS, GetVisitGS} from "../message-center.js";
import {Visit} from "../types.js";
import {dateToDayDateTimeString} from "../util.js";


const visitButton:      HTMLButtonElement = document.querySelector("#btn-visit")!;
const openVisitsButton: HTMLButtonElement = document.querySelector("#btn-open-visits")!;


visitButton.addEventListener("click", async () => {
    const visit = await AddVisitGS.get();
    if (visit) {
        visitButton.classList.add("btn-outline-success");
        visitButton.title = visitToButtonTitle(visit);
    }
});

openVisitsButton.addEventListener("click", async () => {
    createBackgroundTab(chrome.runtime.getURL("/src/pages/visits.html"));
});


;(async function() {
    const visit = await GetVisitGS.get();
    if (visit) {
        visitButton.classList.add("btn-outline-success");
        visitButton.title = visitToButtonTitle(visit);
    }
})();


function visitToButtonTitle(visit: Visit): string {
    return [visit.created, visit.lastVisited]
        .filter((d): d is number => d !== undefined)
        .map(ms => dateToDayDateTimeString(ms, false))
        .join("\n");
}
