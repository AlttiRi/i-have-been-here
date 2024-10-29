import {downloadBlob, localDate, Semaphore} from "@alttiri/util-js";
import {getFromStoreLocal, setToStoreLocal} from "@/util-ext";
import {Visit}     from "@/types";
import {logPurple} from "@/util";


export async function getVisits(): Promise<Visit[]> {
    return await getFromStoreLocal("visits") || []; // todo make non undefined (set the default value on install)
}

// todo?: shared cache // however, seems it is only used in the bg page
// (simple implementation only for `getVisit`, not `getVisits`)
let visitsCache: WeakRef<Visit[]> | null = null;
const registry = new FinalizationRegistry((heldValue) => {
    logPurple(`[visits] 🗑️ ${heldValue} was GC'ed`)();
});
const mutex = new Semaphore(1);


let cacheId = 0;
// bg only
export async function getVisit(url: string): Promise<Visit | null> {
    await mutex.acquire();
    let visits: Visit[] | undefined;
    if (visitsCache) {
        visits = visitsCache.deref();
        if (!visits) {
            logPurple("[visits] ❔ Cache miss")();
        }
    }
    if (!visits) {
        visits = await getVisits();
        visitsCache = new WeakRef<Visit[]>(visits);
        cacheId++;
        registry.register(visits, `Cache (${cacheId})`);
        logPurple(`[visits] 💾 Cached (${cacheId})`)();
    } else {
        logPurple(`[visits] ♻️ Cache use (${cacheId})`)();
    }
    mutex.release();
    const visit = visits.find(visit => visit.url === url);
    return visit || null;
}

// bg only
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

    visitsCache = null;
    logPurple("[visits] ❕ Cache reset")();

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
