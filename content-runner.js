(async () => {
    const contentScriptURL = chrome.runtime.getURL("./content.js");
    try {
        await import(contentScriptURL);
    } catch (e) {
        console.error(e);
    }
})();
