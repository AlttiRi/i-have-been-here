import {filenameLengthLimit, tcSettings, TrimOptionsObject} from "@/bg/store/store";
import {fullUrlToFilename} from "@/util";


export async function getTrimmedTitle(title: string, url: string): Promise<string> {
    const settings: TrimOptionsObject = await tcSettings.getValue();
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
export async function getTitlePartForFilename(title: string, url: string): Promise<string> {
    const needTitle = title && !decodeURIComponent(url).includes(title) && !url.includes(title);
    if (!needTitle) {
        return "";
    }

    const trimmedTitle = await getTrimmedTitle(title, url);

    let titleLine = trimmedTitle
        .replaceAll(/[<>:"\\|?*]+/g, "")
        .replaceAll("/", " ")
        .replaceAll(/\s+/g, " ");

    console.log(titleLine);

    return titleLine;
}

export async function getScreenshotFilename(url: string, title: string): Promise<string> {
    let urlFilename = fullUrlToFilename(url);

    const lengthLimit = await filenameLengthLimit.getValue();
    const minTitleLength       = 5;
    const extraLengthWithTitle = `[ihbh] — .jpg`.length;
    const extraLength          = `[ihbh].jpg`.length;

    if (urlFilename.length > lengthLimit - extraLength) {
        urlFilename = urlFilename.slice(0, lengthLimit - extraLength - 1) + "…";
        return `[ihbh]${urlFilename}.jpg`;
    }

    if (urlFilename.length > lengthLimit - extraLengthWithTitle - minTitleLength) {
        return `[ihbh]${urlFilename}.jpg`;
    }

    let titleLinePart = await getTitlePartForFilename(title, url);

    if (!titleLinePart) {
        return `[ihbh]${urlFilename}.jpg`;
    }

    if (urlFilename.length + titleLinePart.length > lengthLimit - extraLengthWithTitle) {
        titleLinePart = titleLinePart.slice(0, lengthLimit - urlFilename.length - extraLengthWithTitle - 1) + "…";
        return `[ihbh]${urlFilename} — ${titleLinePart}.jpg`;
    }

    return `[ihbh]${urlFilename} — ${titleLinePart}.jpg`;
}
