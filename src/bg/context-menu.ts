import {watchEffect} from "vue";
import {createBackgroundTab} from "@/util-ext-bg";
import {dlShelf}   from "@/bg/store/store";
import {isFirefox} from "@/util";
import {PagePaths} from "@/page-paths";


type ContextMenuFeature = "reload" | "yandex_images" | "download_shelf" | "open_list";

const manifest: chrome.runtime.Manifest = chrome.runtime.getManifest();

export function registerContextMenu(features: ContextMenuFeature[] = ["reload"]): void {
    if (!manifest.permissions?.includes("contextMenus")) {
        console.log(`[warning] No "contextMenus" permission!`);
        return;
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
    if (features.includes("reload")) {
        registerReload();
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
    if (features.includes("yandex_images")) {
        registerYandexImages();
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
    if (features.includes("download_shelf")) {
        void registerDownloadShelf();
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
                createBackgroundTab(chrome.runtime.getURL(PagePaths.visits));
            }
        });
    }
    if (features.includes("open_list")) {
        registerOpenList();
    }
}
