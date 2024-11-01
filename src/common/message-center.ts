import {ExchangeService, SendService, PingService, GetService, PingPongService} from "@/common/classes/messages";
import {Visit, TabCapture, NewTabInfo, TabCaptureResponse, TabsRequest} from "@/common/types";

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
export const TabsGetting           = new ExchangeService<TabsRequest | void, chrome.tabs.Tab[]>(COMMANDS.getTabs);

export const VisitCreating   = new GetService<Visit | null>(COMMANDS.addVisit);
export const VisitGetting    = new GetService<Visit | null>(COMMANDS.getVisit);
export const LastTabsGetting = new GetService<chrome.tabs.Tab[]>(COMMANDS.getLastTabs);

export const IconBlinking:  PingService     = new PingService(COMMANDS.blinkIcon);
export const PingPonging:   PingPongService = new PingPongService(COMMANDS.pingPongBG);
