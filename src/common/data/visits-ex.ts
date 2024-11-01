import {Semaphore} from "@alttiri/util-js";
import {logPurple}       from "@/utils/util";
import {setToStoreLocal} from "@/utils/util-ext";
import {Visit}           from "@/common/types";
import {getVisits} from "./visits";


// Use only in BG

// Simple cache implementation only for `getVisit`, not `getVisits`.
let visitsCache: WeakRef<Visit[]> | null = null;
// Extra cache for `getVisit`.
let visitMapCache: WeakRef<Map<string, Visit | null>> | null = null;

const registry = new FinalizationRegistry((heldValue) => {
    logPurple(`[visits] 🗑️ ${heldValue} was GC'ed`)();
});
const mutex = new Semaphore(1);


let cacheId = 0;
export async function getVisit(url: string): Promise<Visit | null> {
    await mutex.acquire();

    let visitMap: Map<string, Visit | null> | undefined;
    if (visitMapCache) {
        visitMap = visitMapCache.deref();
        if (!visitMap) {
            logPurple("[visits][map] ❔ Cache miss")();
        } else {
            const visit = visitMap.get(url);
            if (visit !== undefined) {
                logPurple("[visits][map] ♻️ Cache use", Object.fromEntries(visitMap))();
                mutex.release();
                return visit;
            }
        }
    }

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

    const visit = visits.find(visit => visit.url === url) || null;
    if (!visitMap) {
        visitMap = new Map<string, Visit>();
        visitMapCache = new WeakRef(visitMap);
        registry.register(visitMap, `Cache (map)`);
    }
    visitMap.set(url, visit);
    logPurple("[visits][map] 💾 Cached")();

    mutex.release();
    return visit;
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

    visitsCache   = null;
    visitMapCache = null;
    logPurple("[visits] ❕ Cache reset")();

    return visit;
}
