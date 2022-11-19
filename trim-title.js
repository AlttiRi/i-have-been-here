import {tcSettings} from "./bg/store/store.js";

export async function getTrimmedTitle(title, url) {
    if (!tcSettings.isReady) {
        await tcSettings.onReady;
    }
    /** @type {TCSettings} */
    const settings = tcSettings.value;
    const _url = new URL(url);
    let _title = title;
    if (settings[_url.hostname]) {
        const hostSettings = settings[_url.hostname];
        hostSettings.trimStartEnd?.forEach(value => {
            if (title.startsWith(value[0]) && title.endsWith(value[1])) {
                _title = _title.slice(value[0].length, -value[1].length);
            }
        });
        hostSettings.trimStart?.forEach(value => {
            if (title.startsWith(value)) {
                _title = _title.slice(value.length);
            }
        });
        hostSettings.trimEnd?.forEach(value => {
            if (title.endsWith(value)) {
                _title = _title.slice(0, -value.length);
            }
        });
    }
    return _title.trim();
}
export async function getTitlePartForFilename(title, url) {
    const needTitle = title && !decodeURIComponent(url).includes(title) && !url.includes(title);
    if (!needTitle) {
        return "";
    }

    const trimmedTitle = await getTrimmedTitle(title, url);

    let titleLine = " — " + trimmedTitle
        .replaceAll(/[<>:"\\|?*]+/g, "")
        .replaceAll("/", " ")
        .replaceAll(/\s+/g, " ");

    console.log(titleLine);

    return titleLine;
}
