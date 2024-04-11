import {quickAccessUrl}     from "/src/bg/store/store.js";
import {openQuickAccessUrl} from "/src/bg/quick-access-url-opener.js";


;(async function() {
    const quickAccessUrlValue = await quickAccessUrl.getValue();
    if (!quickAccessUrlValue) {
        return;
    }
    const openQuickAccessUrlElem = document.querySelector("#open-quick-access-url");
    openQuickAccessUrlElem.title = quickAccessUrlValue;
    openQuickAccessUrlElem.removeAttribute("hidden");
    openQuickAccessUrlElem.addEventListener("click", () => {
        void openQuickAccessUrl();
    });
})();
