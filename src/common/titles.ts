import {TitleCleaner} from "@alttiri/string-magic";
import {filenameLengthLimit, tcCompiledRules} from "@/common/reactive-store";
import {fullUrlToFilename} from "@/utils/util";


export async function getTrimmedTitle(title: string, url: string): Promise<string> {
    const cleaner = TitleCleaner.fromRuleRecords(await tcCompiledRules.getValue());
    return cleaner.clean(url, title);
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
