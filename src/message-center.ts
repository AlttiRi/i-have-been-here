import {ExchangeService, SendService, PingService, GetService} from "@/util-ext-messages";
import {TabCapture} from "@/bg/log-image";
import {Visit}      from "@/types";

const enum COMMANDS {
    logScreenshot       = "log-screenshot",
    saveScreenshot      = "save-screenshot",

    downloadScreenshot = "download-screenshot",
    focusOrCreateNewTab = "focus-or-create-new-tab",

    addVisit    = "add-visit",
    getVisit    = "get-visit",
    getTabs     = "get-tabs",
    getLastTabs = "get-last-tabs",

    changeIcon  = "change-icon",
}

export const LogScreenshotSS:       SendService<TabCapture> = new SendService(COMMANDS.logScreenshot);
export const DownloadScreenshotSS:  SendService<TabCapture> = new SendService(COMMANDS.downloadScreenshot);

export const SaveScreenshotES: ExchangeService<TabCapture, string> = new ExchangeService(COMMANDS.saveScreenshot);
export const FocusOrCreateNewTabES: ExchangeService<NewTabInfo, chrome.tabs.Tab | undefined> = new ExchangeService(COMMANDS.focusOrCreateNewTab);


export const AddVisitGS:    GetService<Visit | null>      = new GetService(COMMANDS.addVisit);
export const GetVisitGS:    GetService<Visit | null>      = new GetService(COMMANDS.getVisit);
export const GetTabsGS:     GetService<chrome.tabs.Tab[]> = new GetService(COMMANDS.getTabs);
export const GetLastTabsGS: GetService<chrome.tabs.Tab[]> = new GetService(COMMANDS.getLastTabs);

export const ChangeIconPS:  PingService = new PingService(COMMANDS.changeIcon);


type NewTabInfo = {
    url: string,
    reload?: boolean,
};
