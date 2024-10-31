import {ExchangeService, SendService, PingService, GetService, PingPongService} from "@/common/classes/messages";
import {Visit, TabCapture, NewTabInfo, TabCaptureResponse} from "@/common/types";

const enum COMMANDS {
    logScreenshot       = "log-screenshot",
    saveScreenshot      = "save-screenshot",

    downloadScreenshot  = "download-screenshot",
    focusOrCreateNewTab = "focus-or-create-new-tab",

    addVisit    = "create-new-visit-for-active-tab-or-update",
    getVisit    = "get-visit-for-active-tab",
    getTabs     = "get-tabs",
    getLastTabs = "get-tabs-ordered-by-last-activity",

    blinkIcon   = "blink-icon-for-active-tab-with-download-image",
    pingPongBG  = "ping-pong-background-script",
}


export const ScreenshotLogging     = new SendService<TabCapture>(COMMANDS.logScreenshot);
export const ScreenshotDownloading = new SendService<TabCapture>(COMMANDS.downloadScreenshot);

export const ScreenshotSaving      = new ExchangeService<TabCapture, TabCaptureResponse>(COMMANDS.saveScreenshot);
export const TabCreatingOrFocusing = new ExchangeService<NewTabInfo, chrome.tabs.Tab | void>(COMMANDS.focusOrCreateNewTab);

export const VisitCreating:   GetService<Visit | null>      = new GetService(COMMANDS.addVisit);
export const VisitGetting:    GetService<Visit | null>      = new GetService(COMMANDS.getVisit);
export const TabsGetting:     GetService<chrome.tabs.Tab[]> = new GetService(COMMANDS.getTabs);
export const LastTabsGetting: GetService<chrome.tabs.Tab[]> = new GetService(COMMANDS.getLastTabs);

export const IconBlinking:  PingService     = new PingService(COMMANDS.blinkIcon);
export const PingPonging:   PingPongService = new PingPongService(COMMANDS.pingPongBG);
