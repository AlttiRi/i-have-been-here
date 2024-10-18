(function() {
    const injectScriptId = "content-script__log-image";
    console.log(`[${injectScriptId}] running`);

    const injected = window[injectScriptId];
    if (injected) {
        console.log(`[${injectScriptId}] the listener is already inited`);
        return;
    }
    window[injectScriptId] = true;
    console.log(`[${injectScriptId}] init the listener`);


    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message?.command !== "log-screenshot--message-exchange-tab") {
            return;
        }
        const dataUrl = message.data;
        logPicture(dataUrl);

        /** Required, since the message is sent from `exchangeMessageWithTab` function
         *  @see {import("src/util-ext.js").exchangeMessageWithTab} */
        sendResponse("[content script]: image logged");
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
