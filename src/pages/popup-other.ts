import {quickAccessUrl}     from "../bg/store/store.js";
import {openQuickAccessUrl} from "../bg/quick-access-url-opener.js";


;(async function() {
    const quickAccessUrlValue = await quickAccessUrl.getValue();
    if (!quickAccessUrlValue) {
        return;
    }
    const openQuickAccessUrlElem: HTMLButtonElement = document.querySelector("#open-quick-access-url")!;
    openQuickAccessUrlElem.title = quickAccessUrlValue;
    openQuickAccessUrlElem.removeAttribute("hidden");
    openQuickAccessUrlElem.addEventListener("click", () => {
        void openQuickAccessUrl();
    });
})();
