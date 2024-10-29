import {Semaphore} from "@alttiri/util-js";
import {logPurple}       from "@/util";
import {setToStoreLocal} from "@/util-ext";
import {Visit}           from "@/types";
import {getVisits} from "./visits";


// Use only in BG

// Simple cache implementation only for `getVisit`, not `getVisits`.
let visitsCache: WeakRef<Visit[]> | null = null;
const registry = new FinalizationRegistry((heldValue) => {
    logPurple(`[visits] 🗑️ ${heldValue} was GC'ed`)();
});
const mutex = new Semaphore(1);


let cacheId = 0;
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
