import {downloadBlob, localDate} from "@alttiri/util-js";
import {getFromStoreLocal, setToStoreLocal} from "@/util-ext";
import {Visit} from "@/types";


export async function getVisits(): Promise<Visit[]> {
    return await getFromStoreLocal("visits") || []; // todo make non undefined (set the default value on install)
}

export async function getVisit(url: string): Promise<Visit | null> {
    const visits = await getVisits();
    const visit = visits.find(visit => visit.url === url);
    return visit || null;
}

export async function addVisit({url, date, title}: {url: string, date: number, title: string}): Promise<Visit> {
    const visits = await getVisits();
    let visit: Visit | undefined = visits.find(visit => visit.url === url);
    if (visit === undefined) {
        visit = {
            url,
            title,
            created: date,
        };
        visits.push(visit);
        await setToStoreLocal("visits", visits);
    } else {
        visit.lastVisited = date;
        await setToStoreLocal("visits", visits);
    }

    return visit;
}

export async function updateVisit(newVisit: Visit): Promise<void> {
    const visits = await getVisits();
    const visit: Visit | undefined = visits.find(visit => visit.url === newVisit.url);
    if (visit === undefined) {
        console.warn("[warning][updateVisit] visit === undefined");
        return;
    }
    const keys = Object.keys(visit) as Array<keyof Visit>;
    keys.forEach(key => delete visit[key]);
    Object.assign(visit, newVisit);
    await setToStoreLocal("visits", visits);
}


export async function exportVisits(): Promise<void> {
    const visits = await getVisits();
    const dateStr = localDate(new Date());
    downloadBlob(new Blob([JSON.stringify(visits, null, " ")]), `[ihbh][${dateStr}] visits.json`);
}

export async function importVisits(visits: Visit[]): Promise<void> {
    // todo add "jsonName" property to verify the value
    await setToStoreLocal("visits", visits);
}
