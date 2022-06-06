/**
 * @typedef {"reload", "yandex_images", "download_shelf"} ContextMenuFeature
 */

import {Store} from "./store.js";

/**
 * @param {ContextMenuFeature[]} features
 */
export function registerContextMenu(features = ["reload"]) {
    if (features.includes("reload")) {
        const id = "reload_extension";
        chrome.contextMenus.create({
            id,
            title: "🔄 Reload",
            contexts: ["browser_action"],
            type: "normal"
        });
        chrome.contextMenus.onClicked.addListener((info, tab) => {
            if (info.menuItemId === id) {
                chrome.runtime.reload();
            }
        });
    }

    if (features.includes("yandex_images")) {
        const id = "yandex_images";
        chrome.contextMenus.create({
            id: "yandex_images",
            title: "🟥 " + chrome.i18n.getMessage("context_menu_yandex_images"),
            contexts: ["browser_action"],
            type: "normal"
        });
        chrome.contextMenus.onClicked.addListener((info, tab) => {
            if (info.menuItemId === id) {
                chrome.tabs.create({url: "https://yandex.com/images/"});
            }
        });
    }

    if (features.includes("download_shelf") && chrome.downloads.setShelfEnabled) {
        const id = "download_shelf";
        let checked = Store.download_shelf.value;

        Store.on(Store.download_shelf, value => {
            console.log("Store.download_shelf changed", value);
            chrome.downloads.setShelfEnabled(value);
        });

        chrome.contextMenus.create({
            id: "download_shelf",
            title: "Enable download shelf",
            contexts: ["browser_action"],
            type: "checkbox",
            checked
        });

        chrome.downloads.setShelfEnabled(checked);
        chrome.contextMenus.onClicked.addListener((info, tab) => {
            if (info.menuItemId === id) {
                checked = !checked;
                Store.download_shelf = checked;
                info.checked = checked;
            }
        });
    }
}
