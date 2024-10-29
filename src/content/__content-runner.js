// a content script runner // allows to use es modules in content scripts
(async () => {
    const contentScriptURL = chrome.runtime.getURL("/src/content/content--log-ext-name.js");
    try {
        /** @type StoreLocalModel["commonSettings"] */
        const cs = await getFromStoreLocal("commonSettings");
        if (cs.contentLogExtName === true) {
            // [warning]
            // `import` does not work in embedded resource page (https://x.xxx/video.mp4) in chrome
            // with "run_at": "document_start", it requires to add a macro task delay, or use "document_end" in manifest.
            await import(contentScriptURL);
        }
    } catch (e) {
        console.error(e);
    }

    function getFromStoreLocal(key) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(key ? [key] : null, object => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError.message);
                }
                resolve(key ? object[key] : object);
            });
        });
    }
})();

// todo: use .ts for content files
