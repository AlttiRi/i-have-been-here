import {
    createRouter,
    createWebHashHistory,
    isNavigationFailure,
    NavigationFailure,
    NavigationFailureType,
} from "vue-router";
import {sleep} from "@alttiri/util-js";


const routes = [
    {
        path: "/",
        name: "default",
        redirect: { name: "settings" },
    },
    {
        path: "/settings",
        name: "settings",
        component: () => import("@/vue-pages/settings/SettingsPage.vue"),
        meta: { title: "Settings" },
    },
    {
        path: "/tabs-list",
        name: "tabs.list",
        component: () => import("@/vue-pages/tabs/TabsListPage.vue"),
        meta: { title: "Tabs (list)" },
    },
    {
        path: "/tabs-json",
        name: "tabs.json",
        component: () => import("@/vue-pages/tabs/TabsJsonPage.vue"),
        meta: { title: "Tabs (json)" },
    },
    {
        path: "/visits",
        name: "list.visits",
        component: () => import("@/vue-pages/list/VisitsPage.vue"),
        meta: { title: "Visits" },
    },
    {
        path: "/screens",
        name: "list.screens",
        component: () => import("@/vue-pages/list/ScreenshotsPage.vue"),
        meta: { title: "Screenshots" },
    },
];

let lastTargetElement: HTMLElement | null = null;

// todo keep page's height and set it before `iAmReady` for the instant scroll
//  or set the height as "savedPosition" + windows' height
let promise = Promise.resolve("initial");
const dummy = (value?: any) => {};
let _resolve = dummy;
export function waitMe() {
    promise = new Promise(resolve => _resolve = resolve);
}
export function iAmReady(value?: any) {
    _resolve(value);
}

export const router = createRouter({
    history: createWebHashHistory("/bundle/pages/pages.html"),
    routes,
    linkActiveClass: "active",
    async scrollBehavior(to, from, savedPosition) {
        // console.log("scrollBehavior", {to, from});
        // console.log("savedPosition", savedPosition);
        if (to.name === from.name && to.hash === from.hash) {
            // console.log("--- Same link click ---");
            return;
        }
        if (to.name !== from.name || to.hash !== from.hash) {
            // console.log("--- Scroll To HASH ---");
            if (lastTargetElement) {
                lastTargetElement.classList.remove("hash-target");
            }
            const hash = to.hash.slice(1);
            if (!hash) {
                lastTargetElement = null;
                // console.log("!hash");
            } else {
                await promise;
                lastTargetElement = document.getElementById(hash);
                if (lastTargetElement) {
                    lastTargetElement.classList.add("hash-target");
                    // return { el: to.hash, left: 0, /* ignored */ };
                    // since poo-router does horizontal scroll
                    lastTargetElement.scrollIntoView();
                    return;
                }
            }
        }
        if (savedPosition) {
            // console.log("--- SavedPosition ---", savedPosition);
            if (_resolve === dummy) {
                // console.log("--- Sleep 0 (Dummy's Promise) ---");
                await sleep(0);
            }
            await promise;
            return {
                ...savedPosition,
                behavior: "instant",
            };
        }
    },
});


router.beforeEach((to, from, next) => {
    if (to.name === from.name) {
        next();
        return;
    }
    document.title = to.meta.title ? `${to.meta.title} - IHBH (I Have Been Here)` : "IHBH (I Have Been Here)";
    next();
});

router.afterEach((to, from, failure) => {
    if (failure && !isNavigationFailure(failure, NavigationFailureType.duplicated)) {
        console.error({to, from});
        console.error(failure);
    }
});

export async function setHash(hash: string): Promise<void | NavigationFailure> {
    await sleep(); // poo-router fix (wait the navigation end) // (opening of the "tabs list" route)
    return router.replace({ hash: `#${hash}` });
}

export function getHash(): string {
    // console.log(router.currentRoute.value);
    return router.currentRoute.value.hash.slice(1);
}
