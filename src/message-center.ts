import {ExchangeService, SendService, PingService, GetService} from "./util-ext-messages.js";
import {TabCapture} from "./bg/log-image.js";
import {Visit} from "./types.js";

const enum COMMANDS {
    logScreenshot      = "log-screenshot",
    saveScreenshot     = "save-screenshot",
    downloadScreenshot = "download-screenshot",
    addVisit = "add-visit",
    getVisit = "get-visit",
    getTabs  = "get-tabs",
    changeIcon = "change-icon",
}

export const LogScreenshotSS:      SendService<TabCapture> = new SendService(COMMANDS.logScreenshot);
export const DownloadScreenshotSS: SendService<TabCapture> = new SendService(COMMANDS.downloadScreenshot);
export const SaveScreenshotES: ExchangeService<TabCapture, string> = new ExchangeService(COMMANDS.saveScreenshot);

export const AddVisitGS: GetService<Visit | null> = new GetService(COMMANDS.addVisit);
export const GetVisitGS: GetService<Visit | null> = new GetService(COMMANDS.getVisit);

export const GetTabsGS: GetService<chrome.tabs.Tab[]> = new GetService(COMMANDS.getTabs);

export const ChangeIconPS: PingService = new PingService(COMMANDS.changeIcon);
