(function inject() {
    const injectScriptId = "content__image_log";
    console.log("injecting: " + injectScriptId);

    const injected = window[injectScriptId];
    if (injected) {
        return;
    }
    window[injectScriptId] = true;


    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.text !== "log-screenshot") {
            return;
        }
        logPicture(message.url);
        return true;
    });

    function logPicture(url, scale = 0.5) {
        const img = new Image();
        img.onload = () => {
            console.log("%c ", `
               padding: ${Math.floor(img.height * scale / 2)}px ${Math.floor(img.width * scale / 2)}px;
               background: url("${url}");
               background-size: ${img.width * scale}px ${img.height * scale}px;
               font-size: 0;
            `);
        };
        img.src = url;
    }
})();
