// a content script runner // allows to use es modules in content scripts
(async () => {
    const contentScriptURL = chrome.runtime.getURL("/src/content/content--log-ext-name.js");
    try {
        await import(contentScriptURL);
    } catch (e) {
        console.error(e);
    }
})();
