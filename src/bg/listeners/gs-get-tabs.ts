import {queryTabs}   from "@/utils/util-ext";
import {TabsGetting} from "@/common/message-center";


export function initGS_GetTabs(): void {
    TabsGetting.addListener(async function getTabsHandler(data, sender): Promise<chrome.tabs.Tab[]> {
        if (!sender.tab || !data) {
            return queryTabs();
        }
        if (!data.extra) {
            return queryTabs(data.query);
        }
        let {
            query = {},
            extra: {
                onTheRight,
                sameWindow,
                sameWorkspace,
            },
        } = data;

        if (onTheRight) {
            sameWindow    = true;
            sameWorkspace = true;
        }

        const tabIndex = sender.tab.index;
        const windowId = sender.tab.windowId;
        const workspaceId = "workspaceId" in sender.tab ? sender.tab.workspaceId : undefined;

        const tabs = await queryTabs({
            ...query,
            ...(sameWindow ? {windowId}: {}),
        });
        return tabs.filter(tab => {
            if (sameWorkspace && "workspaceId" in tab && tab.workspaceId !== workspaceId) {
                return false;
            }
            if (onTheRight && tab.index <= tabIndex) {
                return false;
            }
            return true;
        });
    });
}
