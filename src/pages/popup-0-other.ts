import {quickAccessUrl}     from "../bg/store/store.js";
import {openQuickAccessUrl} from "../bg/quick-access-url-opener.js";


const openQuickAccessUrlBtn: HTMLButtonElement = document.querySelector("#openQuickAccessUrlBtn")!;

const toggleToBookmarksBtn:  HTMLButtonElement = document.querySelector("#toggleToBookmarksBtn")!;
const toggleToVisitsBtn:     HTMLButtonElement = document.querySelector("#toggleToVisitsBtn")!;
const bookmarkControls: HTMLDivElement = document.querySelector("#bookmarkControls")!;
const visitControls:    HTMLDivElement = document.querySelector("#visitControls")!;

export async function initHomeBtn(): Promise<void> {
    const quickAccessUrlValue: string = await quickAccessUrl.getValue();
    if (!quickAccessUrlValue) {
        return;
    }
    openQuickAccessUrlBtn.title = quickAccessUrlValue;
    openQuickAccessUrlBtn.classList.remove("hidden");
    openQuickAccessUrlBtn.addEventListener("click", () => {
        void openQuickAccessUrl();
    });
}

export function initControls(): void {
    visitControls.removeAttribute("hidden");
}
