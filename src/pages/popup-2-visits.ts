import {createBackgroundTab} from "../util-ext-bg.js";
import {AddVisitGS, GetVisitGS} from "../message-center.js";
import {Visit} from "../types.js";
import {dateToDayDateTimeString} from "../util.js";


const addVisitBtn:   HTMLButtonElement = document.querySelector("#addVisitBtn")!;
const openVisitsBtn: HTMLButtonElement = document.querySelector("#openVisitsBtn")!;

export async function initVisits(): Promise<void> {
    addVisitBtn.addEventListener("click", async () => {
        const visit = await AddVisitGS.get();
        if (visit) {
            addVisitBtn.classList.add("btn-outline-success");
            addVisitBtn.title = visitToButtonTitle(visit);
        }
    });

    openVisitsBtn.addEventListener("click", async () => {
        createBackgroundTab(chrome.runtime.getURL("/src/pages/visits.html"));
    });

    const visit = await GetVisitGS.get();
    if (visit) {
        addVisitBtn.classList.add("btn-outline-success");
        addVisitBtn.title = visitToButtonTitle(visit);
    }
}


function visitToButtonTitle(visit: Visit): string {
    return [visit.created, visit.lastVisited]
        .filter((d): d is number => d !== undefined)
        .map(ms => dateToDayDateTimeString(ms, false))
        .join("\n");
}
