import {watchEffect} from "vue";
import {createBackgroundTab, manifest} from "@/utils/util-ext";
import {isFirefox} from "@/utils/util";
import {PagePaths} from "@/common/page-paths";
import {dlShelf}   from "@/common/reactive-store";


type ContextMenuFeature = "reload_extension" | "yandex_images" | "download_shelf" | "open_list";

export function initContextMenu(features: ContextMenuFeature[] = ["reload_extension"]): void {
    if (!manifest.permissions?.includes("contextMenus")) {
        console.log(`[warning] No "contextMenus" permission!`);
        return;
    }
    if (features.includes("reload_extension")) {
        registerReload();
    }
    if (features.includes("yandex_images")) {
        registerYandexImages();
    }
    if (features.includes("download_shelf")) {
        void registerDownloadShelf();
    }
    if (features.includes("open_list")) {
        registerOpenList();
    }
}

function registerReload() {
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

function registerYandexImages() {
    const id = "yandex_images";
    chrome.contextMenus.create({
        id,
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

async function registerDownloadShelf() {
    if (isFirefox) {
        return;
    } else
    if (!chrome.downloads?.setShelfEnabled) {
        console.log(`[warning] No "downloads", "downloads.shelf" permissions!`);
        return;
    }
    const id = "download_shelf";
    if (!dlShelf.isReady) {
        await dlShelf.onReady;
    }
    const checked = dlShelf.value;
    chrome.contextMenus.create({
        id,
        title: "💾 Enable download shelf",
        contexts: ["browser_action"],
        type: "checkbox",
        checked
    });
    watchEffect(() => {
        const checked = dlShelf.value;
        console.log("downloadShelf watchEffect", checked);
        chrome.downloads.setShelfEnabled(checked);
        chrome.contextMenus.update(id, {checked});
    });

    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
        console.log("menuItemId", info.menuItemId, info);
        if (info.menuItemId === id) {
            await dlShelf.setValue(info.checked!); // must not be `undefined` since `type: "checkbox"`
        }
    });
}

function registerOpenList() {
    const id = "open_list";
    chrome.contextMenus.create({
        id,
        title: "📃 Open list",
        contexts: ["browser_action"],
        type: "normal"
    });
    chrome.contextMenus.onClicked.addListener((info, tab) => {
        if (info.menuItemId === id) {
            createBackgroundTab(chrome.runtime.getURL(PagePaths.list_visits));
        }
    });
}
