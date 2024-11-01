import {TCCompiledRules, TCRuleString, TitleCleaner} from "@alttiri/string-magic";
import {ScreenshotDataId, ScreenshotInfo, StoreLocalBase, URLString, Visit} from "@/common/types";
import {
    Base64,
    logIndigo, logOrange,
} from "@/utils/util";
import {
    getFromStoreLocal,
    removeFromStoreLocal,
    setToStoreLocal,
}                 from "@/utils/util-ext";
import {getScdId} from "@/common/image-data";
import {commonSettingsDefault} from "@/common/reactive-store";


const lastStoreVersion = getLastVersion();
let wasInstalled = false;

/**
 `onStartup` triggers on the browser start only.
 `onInstalled` with `reason === update` on extension reloading.
 `onInstalled` with `reason === install` on extension first loading (installing). One time.
 Toggling the extension does not trigger the listeners above.
 */
export function initStartupListeners() {
    chrome.runtime.onInstalled.addListener(async function setInitialVersion(details: chrome.runtime.InstalledDetails) {
        if (details.reason === "install") {
            logIndigo("[⚒]", "The extension was installed")();
            wasInstalled = true;
            await onInstallInit();
            logIndigo("[⚒]", "Set", lastStoreVersion, "store version")();
        } else if (details.reason === "update") {
            logIndigo("[⚒]", "The extension was reloaded")();
        } else {
            logIndigo("[⚒]", `Installed (reason: "${details.reason}")`)();
        }
    });
    chrome.runtime.onStartup.addListener(() => {
        logIndigo("[⚒]", "Browser startup")();
    });
}
async function onInstallInit() {
    await setToStoreLocal("__json_name", "ihbh-extension-storage");
    await setToStoreLocal("__version", lastStoreVersion);
}

export async function updateStoreModel(): Promise<void> {
    let version: number = await getFromStoreLocal("__version");
    if (version === undefined) {
        // @ts-ignore
        version = await getFromStoreLocal("version");
    }
    if (version === undefined && wasInstalled) {
        logIndigo("[⚒]", "Skip store updating")();
        return;
    }
    if (version === undefined) {
        logOrange("Storage was wiped. Re-init it.")();
        await onInstallInit();
        return;
    }
    if (version === lastStoreVersion) {
        logIndigo("[⚒]", `Store is up to date (${lastStoreVersion})`)();
        return;
    }

    async function bumpVersion() {
        version = version + 1;
        await setToStoreLocal("__version", version);
        logIndigo(`Store was updated to version ${version}`)();
    }

    if (version === 1) {
        type ScreenshotDataId_V1 = `screenshot:${URLString}`;
        type ScreenshotEntry_V1 = [ScreenshotDataId_V1, Base64];
        type StoreLocalModel_V1 = {
            [scd_id: ScreenshotDataId_V1]: Base64,
            visits: Visit_V1[],
        } & StoreLocalBase;
        type Visit_V1 = {
            url:    string,
            title?: string,
            date:   number | number[],
        };

        const isScreenshotEntry_V1 = function(entry: [string, unknown]): entry is ScreenshotEntry_V1 {
            return entry[0].startsWith(`screenshot:`);
        }
        const getScreenshotEntries_V1 = async function(): Promise<ScreenshotEntry_V1[]>  {
            return Object.entries(await getFromStoreLocal()).filter(isScreenshotEntry_V1);
        }

        await (async function updateVisits() {
            // @ts-ignore
            const visits: Visit_V1[] = await getFromStoreLocal("visits") || [];
            const newVisits: Visit[] = [];
            for (const visit of visits) {
                const newVisit: Visit = {
                    url: visit.url,
                    title: visit.title || "",
                    created: Array.isArray(visit.date) ? visit.date[0] : visit.date,
                };
                if (Array.isArray(visit.date)) {
                    newVisit.lastVisited = visit.date[visit.date.length - 1];
                }
                newVisits.push(newVisit);
            }
            await setToStoreLocal("visits", newVisits);
        })();

        await (async function updateScreenshots() {
            const entries: ScreenshotEntry_V1[] = await getScreenshotEntries_V1();

            const screenshots: ScreenshotInfo[] = [];
            const prefixLength_v1 = "screenshot:".length;
            for (const [scd_id_v1, base64] of entries) {
                const url: URLString = scd_id_v1.slice(prefixLength_v1);
                const scd_id = await getScdId(base64);
                screenshots.push({
                    scd_id,
                    url,
                    title: "",
                    created: 0,
                });
                // @ts-ignore
                await removeFromStoreLocal(scd_id_v1);
                await setToStoreLocal(scd_id, base64);
            }
            await setToStoreLocal("screenshots", screenshots);
        })();

        await bumpVersion(); // -> 2
    }

    if (version === 2) {
        // @ts-ignore
        const tcs: TrimConfig = await getFromStoreLocal("titleCutterSettings");
        if (tcs) {
            // @ts-ignore
            await setToStoreLocal("titleTrimmerConfig", tcs);
        }
        // @ts-ignore
        await removeFromStoreLocal("titleCutterSettings");

        await bumpVersion(); // -> 3
    }

    if (version === 3) {
        type TrimOptions = {
            trimEnd?: string[],
            trimStart?: string[],
            trimStartEnd?: string[][],
        };
        type hostname = string;
        type TrimConfig = {
            [key: hostname]: TrimOptions
        };
        function _getPayload(command: keyof TrimOptions, data: string[] | string[][]): string {
            const parts = data.flat(); // expects that `trimStartEnd` has only one command
            if (command === "trimStartEnd") {
                if (parts.length !== 2) {
                    return "";
                }
            }
            const hasSpaces = parts.some(part => part.trim().includes(" "));
            if (!hasSpaces) {
                return parts.join(" ");
            }
            if (parts.length === 1) {
                return ":" + parts[0];
            }
            const hasPipes = parts.some(part => part.includes("|"));
            if (!hasPipes) {
                return "|:" + parts.join(" | ");
            }
            return parts.join("\n");
        }
        function transformOldRules(oldConf: TrimConfig): TCRuleString[] {
            const newRules: TCRuleString[] = [];
            for (const [site, options] of Object.entries(oldConf)) {
                newRules.push(`site:${site}`);
                for (const [command, data] of Object.entries(options) as [keyof TrimOptions, TrimOptions[keyof TrimOptions]][]) {
                    if (!data) { continue; }
                    const payload = _getPayload(command, data);
                    if (command === "trimStart") {
                        newRules.push(`trim-start:${payload}`);
                    } else
                    if (command === "trimEnd") {
                        newRules.push(`trim-end:${payload}`);
                    } else
                    if (command === "trimStartEnd") {
                        newRules.push(`trim-start-end:${payload}`);
                    }
                }
            }
            return newRules;
        }

        // @ts-ignore
        const ttc: TrimConfig = await getFromStoreLocal("titleTrimmerConfig");
        if (ttc) {
            const tcRuleStrings: TCRuleString[] = transformOldRules(ttc);
            await setToStoreLocal("titleCleanerRuleStrings", tcRuleStrings);
            const rules: TCCompiledRules = TitleCleaner.compileRuleStrings(tcRuleStrings);
            await setToStoreLocal("titleCleanerCompiledRules", rules);
            // @ts-ignore
            await removeFromStoreLocal("titleTrimmerConfig");
        }

        await bumpVersion(); // -> 4
    }

    if (version === 4) { // +2 new properties in "commonSettings"
        const cs = await getFromStoreLocal("commonSettings");
        if (cs.contentLogExtName === undefined) {
            cs.contentLogExtName = commonSettingsDefault.contentLogExtName;
        }
        if (cs.contentLogScreenshot === undefined) {
            cs.contentLogScreenshot = commonSettingsDefault.contentLogScreenshot;
        }
        await setToStoreLocal("commonSettings", cs);

        await bumpVersion(); // -> 5
    }

    if (version === 5) {
        await setToStoreLocal("__json_name", "ihbh-extension-storage");
        await bumpVersion(); // -> 6
    }

    if (version === 6) {
        // @ts-ignore
        await removeFromStoreLocal("version");
        await setToStoreLocal("__version", 7);
        await bumpVersion(); // -> 7
    }

    if (version === 7) {
        type ScreenshotDataIdOld =  `scd:${Lowercase<string>}`;
        type ScreenshotDataIdNew = `~scd:${Lowercase<string>}`;
        const scs: ScreenshotInfo[] | undefined  = await getFromStoreLocal("screenshots");
        if (scs) {
            for (const sci of scs) {
                const scd_id = sci.scd_id;
                if (scd_id.startsWith("~")) {
                    continue;
                }
                const scd = await getFromStoreLocal(scd_id);
                const updatedScDataId: ScreenshotDataId = "~" + scd_id as ScreenshotDataId;
                await setToStoreLocal(updatedScDataId, scd);
                sci.scd_id = updatedScDataId;
                await setToStoreLocal("screenshots", scs); // just in case do it on each iter
                await removeFromStoreLocal(scd_id);
            }
        }
        await bumpVersion(); // -> 8
    }
}
// [note] Do not forget to update `getLastVersion` below! And use `bumpVersion()`.
function getLastVersion() {
    return 8;
}

// todo?: handle errors/broken data
