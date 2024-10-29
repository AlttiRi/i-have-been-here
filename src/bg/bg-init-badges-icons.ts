import {watch} from "vue";
import {getSelfDebounced, logGreen, logOrange, logTeal, Monitor} from "@/util";
import {inIncognitoContext, setBadgeText, setIcon}               from "@/util-ext";
import {queryTabs}     from "@/util-ext-bg";
import {urlOpenerMode} from "@/bg/shared/store";
import {getVisit}      from "@/bg/shared/visits-ex";
import {Visit}         from "@/types";


const imgFilename = inIncognitoContext ? "images/black.png" : "images/white.png";
const imgPath:       string = chrome.runtime.getURL(imgFilename);
const greenMarkPath: string = chrome.runtime.getURL("images/green-mark.png");

const openedTabs: Map<number, chrome.tabs.Tab> = new Map();
const updateMonitor = new Monitor();

type UpdateIconOpts = {url: string, } | {tabId: number};

/** BG only */
export function updateIconBy(opt: UpdateIconOpts): Promise<void> {
    if ("url" in opt) {
        return updateIconByUrl(opt.url);
    }
    return updateIconByTabId(opt.tabId);
}

// Count tabs with separation for incognito and normal mode
// + changes icon
export async function initBadgesAndIcons() {
    logTeal("[initBadgesAndIcons]", "init")();

    void setDefaultIcon(imgPath);

    const tabs = await queryTabs();
    for (const tab of tabs) {
        if (tab.id === undefined) {
            console.warn("[initBadgesAndIcons] tab.id === undefined");
            continue;
        }
        openedTabs.set(tab.id, tab);
    }

    if (!urlOpenerMode.isReady) {
        await urlOpenerMode.onReady;
    }

    watch(urlOpenerMode.ref, () => {
        console.log("--- watch ---");
        updateIconsForAllTabs();
    });

    updateIconsForAllTabs();
    updateBadgeTextForAllTabs();

    addListeners();
}

function addListeners() {
    /**
     * Increase the tab count (badge text) for all tabs
     */
    chrome.tabs.onCreated.addListener(tabOnCreated);
    /**
     * `changeInfo.status === "loading"`
     * - may be triggered multiple time while loading
     * - may be triggered before tab is closed (before `onRemoved`)
     */
    chrome.tabs.onUpdated.addListener(tabOnUpdated);
    chrome.tabs.onRemoved.addListener(tabOnRemoved);
    chrome.windows.onFocusChanged.addListener(windowOnFocusChanged);

    function tabOnCreated(tab: chrome.tabs.Tab) {
        logGreen("[tabOnCreated]", tab)();
        if (tab.id === undefined) {
            console.warn("[tabOnCreated] tab.id === undefined");
            return;
        }
        openedTabs.set(tab.id, tab);
        updateBadgeTextForAllTabs();
    }

    function tabOnUpdated(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) {
        logGreen("[tabOnUpdated]", tabId, changeInfo, tab)();
        openedTabs.set(tabId, tab);
        if (changeInfo.status === "loading") {
            void updateIconByTabId(tabId);
            void updateBadgeTextByTabId(tabId);
        }
    }

    const selfDebounced = getSelfDebounced(16); // multiple tabs closing fix
    function tabOnRemoved(tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) {
        logGreen("[tabOnRemoved]", tabId, removeInfo)();
        if (openedTabs.has(tabId)) {
            openedTabs.delete(tabId);
            selfDebounced().then((debounced) => {
                if (debounced) {
                    return;
                }
                updateBadgeTextForAllTabs();
            });
        } else {
            console.warn(`[warning][onRemoved] tab.id ${tabId} is not found`);
        }
        updateMonitor.clear(tabId);
    }


    function windowOnFocusChanged(windowId: number, _filters?: chrome.windows.WindowEventFilter) {
        logGreen("[windowOnFocusChanged]", windowId)();
        // Does not seem to be required anymore
        // if (windowId !== chrome.windows.WINDOW_ID_NONE) { // incognito, devtools
        //     setDefaultIcon(imgPath);
        // }
    }
}


/** Ignores tabs with an icon set with `tabId` parameter */
function setDefaultIcon(path: string): Promise<void> {
    return setIcon({
        path,
    });
}

/** Sets the icons for the tabs of the passed tab ID array, or for all the opened tabs. */
function updateIconsForAllTabs(): void {
    const tabIds = [...openedTabs.keys()];
    logTeal("[updateIcons]", tabIds.length, tabIds)();

    for (const tabId of tabIds) {
        void updateIconByTabId(tabId);
    }
}
async function updateIconByUrl(url: string): Promise<void> {
    const tabIds = [...openedTabs.entries()].filter(([k, v]) => {
        if (v.url === url) {
            return true;
        }
    }).map(([k, v]) => k);
    for (const tabId of tabIds) {
        void updateIconByTabId(tabId);
    }
}
async function updateIconByTabId(tabId: number): Promise<void> {
    const monitor = updateMonitor.get(tabId);

    const tab = openedTabs.get(tabId);
    if (tab === undefined) {
        console.warn("[error][updateIconByTabId]", "tab === undefined");
        return;
    }
    const url: string | undefined = tab.url;
    if (url === undefined) {
        console.warn("[error][updateIconByTabId]", "url === undefined");
        return;
    }

    let tabCounterIconData = {path: imgPath};
    if (!urlOpenerMode.value) {
        const visit: Visit | null = await getVisit(url); // todo cache
        if (visit) {
            tabCounterIconData.path = greenMarkPath;
        }
    }

    if (!openedTabs.has(tabId)) {
        logOrange("[updateIconByTabId] tab was already removed", tabId)(); // 1 //
        return;
    }
    try {
        const urlStillNotChanged = openedTabs.get(tabId)?.url === url;
        if (urlStillNotChanged) {
            await monitor.acquire();
            await setIcon({
                ...tabCounterIconData,
                tabId,
            });
        } else {
            // else the tab's url was updated while async operations, do nothing in this call
            logOrange("[updateIconByTabId] tab's url was updated", tabId)();
        }
    } catch (error) {
        // expected, when multiple tab was closed // I don't want to add delays (extra icon blinking)
        logOrange("[updateIconByTabId]", error)(); // 2 //
    } finally {
        monitor.release();
    }
}

/** Sets the count of the opened tabs as the badge text */
function updateBadgeTextForAllTabs(): void {
    const tabIds = [...openedTabs.keys()];
    logTeal("[updateBadgeTextForAllTabs]", tabIds.length, tabIds)();

    for (const tabId of tabIds) {
        void updateBadgeTextByTabId(tabId);
    }
}
async function updateBadgeTextByTabId(tabId: number): Promise<void> {
    logTeal("[updateBadgeTextByTabId]",tabId)();
    try {
        await setBadgeText({
            text: openedTabs.size.toString(),
            tabId: tabId
        });
    } catch (error) {
        console.warn("[error][updateBadgeTextByTabId]", error, tabId);
    }
}
