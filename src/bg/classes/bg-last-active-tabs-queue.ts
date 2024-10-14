export class LastActiveTabsQueue {
    static instance = new LastActiveTabsQueue();
    private windowIdsToTabs: Map<number, chrome.tabs.Tab[]>;

    /** @private */
    constructor() {
        this.windowIdsToTabs = new Map();
        void this.init();
    }

    async init() {
        const self = this;

        const windows: chrome.windows.Window[] = await new Promise(resolve => chrome.windows.getAll(resolve));
        for (const window of windows) {
            const tabs: chrome.tabs.Tab[] = await new Promise(resolve => {
                chrome.tabs.query({windowId: window.id}, resolve);
            });
            if (window.id === undefined) {
                console.warn("[warning][LastActiveTabsQueue.init] window.id === undefined");
                continue;
            }
            self.windowIdsToTabs.set(window.id, tabs);
        }

        chrome.tabs.onActivated.addListener(({tabId, windowId}) => {
            // console.log("onActivated", tabId, windowId);
            const tabs = self.windowIdsToTabs.get(windowId);
            if (tabs === undefined) {
                console.warn("[warning][LastActiveTabsQueue.init][onActivated] tabs === undefined");
                return;
            }
            const tab = tabs.find(tab => tab.id === tabId);
            if (tab === undefined) {
                console.warn("[warning][LastActiveTabsQueue.init][onActivated] tab === undefined");
                return;
            }
            // may have outdated "loading" state !!!
            tabs.splice(tabs.indexOf(tab), 1);
            tabs.push(tab);
            // console.log(self.windowIdsToTabs);
        });

        chrome.tabs.onCreated.addListener(tab => {
            // console.log("onCreated", tab);
            if (!self.windowIdsToTabs.has(tab.windowId)) {
                self.windowIdsToTabs.set(tab.windowId, []);
            }
            const tabs = self.windowIdsToTabs.get(tab.windowId);
            if (tabs === undefined) {
                console.warn("[warning][LastActiveTabsQueue.init][onCreated] tabs === undefined");
                return;
            }
            tabs.push(tab);
        });

        chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
            // console.log("onRemoved", tabId, removeInfo);
            const tabs = self.windowIdsToTabs.get(removeInfo.windowId);
            if (tabs === undefined) {
                console.warn("[warning][LastActiveTabsQueue.init][onRemoved] tabs === undefined");
                return;
            }
            const tab = tabs.find(tab => tab.id === tabId);
            if (tab === undefined) {
                console.warn("[warning][LastActiveTabsQueue.init][onRemoved] tab === undefined");
                return;
            }
            tabs.splice(tabs.indexOf(tab), 1);
            if (!tabs.length) {
                self.windowIdsToTabs.delete(removeInfo.windowId);
            }
        });
    }

    static async getLastActiveTabsForCurrentWindow(): Promise<chrome.tabs.Tab[] | null> {
        const self = LastActiveTabsQueue.instance;
        const window: chrome.windows.Window = await new Promise(resolve => chrome.windows.getCurrent(resolve));
        if (window.id === undefined) {
            console.warn("[warning][getLastActiveTabsForCurrentWindow] window.id === undefined");
            return null;
        }
        const tabs = self.windowIdsToTabs.get(window.id);
        if (tabs === undefined) {
            console.warn("[warning][getLastActiveTabsForCurrentWindow] tabs === undefined");
            return null;
        }
        if (tabs.length === 0) {
            console.warn("[warning][getLastActiveTabsForCurrentWindow] tabs.length === 0");
            return null;
        }
        return tabs;
    }

    static async getLastActiveTabByUrl(url: string): Promise<chrome.tabs.Tab | null> { // for active window
        const tabs = await this.getLastActiveTabsForCurrentWindow();
        if (tabs === null) {
            return null;
        }
        const expectedTabs = tabs.filter(tab => tab.url === url || tab.pendingUrl === url);
        if (expectedTabs.length === 0) {
            console.warn("[warning][getLastActiveTabByUrl] expectedTabs.length === 0");
            return null;
        }
        return expectedTabs[expectedTabs.length - 1];
    }
}
