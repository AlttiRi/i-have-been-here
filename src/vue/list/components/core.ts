import {dateToDayDateTimeString} from "@/util";

export function dateFormatter(date: number | string | Date): string {
    return dateToDayDateTimeString(date, false);
}
