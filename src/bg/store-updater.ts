import {TCCompiledRules, TCRuleString, TitleCleaner} from "@alttiri/string-magic";
import {ScreenshotInfo, StoreLocalBase, URLString, Visit} from "@/common/types";
import {
    Base64,
    logIndigo,
}                 from "@/utils/util";
import {
    getFromStoreLocal,
    removeFromStoreLocal,
    setToStoreLocal,
}                 from "@/utils/util-ext";
import {getScdId} from "@/common/image-data";
import {commonSettingsDefault} from "@/common/reactive-store";


const lastStoreVersion = 5;
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
            await setToStoreLocal("version", lastStoreVersion);
            logIndigo("[⚒]", "Set", lastStoreVersion, "store version")();
            // void setToStoreLocal("jsonName", "ihbh-extension-storage"); // todo
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

export async function updateStoreModel(): Promise<void> {
    let version: number = await getFromStoreLocal("version");
    if (version === undefined && wasInstalled) {
        logIndigo("[⚒]", "Skip store updating")();
        return;
    }
    if (version === lastStoreVersion) {
        logIndigo("[⚒]", "Store is up to date")();
        return;
    }

    async function bumpVersion() {
        await setToStoreLocal("version", version);
        logIndigo(`Store was updated to version ${version}`)();
        version = version + 1;
    }

    if (version === 1) {
        type ScreenshotDataId_V1 = `screenshot:${URLString}`;
        type ScreenshotEntry_V1 = [ScreenshotDataId_V1, Base64];
        type StoreLocalModel_V1 = {
            [sc_id: ScreenshotDataId_V1]: Base64,
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
}
// [note] Do not forget to update `lastStoreVersion` above! And use `bumpVersion()`.

// todo (?) handle errors/broken data