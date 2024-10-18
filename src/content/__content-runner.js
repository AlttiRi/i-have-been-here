// a content script runner // allows to use es modules in content scripts
(async () => {
    const contentScriptURL = chrome.runtime.getURL("/src/content/content--log-ext-name.js");
    try {
        await import(contentScriptURL); // `import` does not work in embedded resource page (.../video.mp4) in chrome
    } catch (e) {
        console.error(e);
    }
})(); // todo remove, use .ts for content files
