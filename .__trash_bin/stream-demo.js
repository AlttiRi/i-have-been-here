// streaming bg-s -> content-s

let resolve;
let promise;
function updatePromise() {
    promise = new Promise(_resolve => {
        resolve = _resolve;
    });
}
updatePromise();


const port = chrome.runtime.connect({name: "demo-fetch"});
port.onMessage.addListener(async function({done, value, i}) {
    // console.log({done, value, i});
    const ab = await fetch(value).then(r => r.arrayBuffer());
    const u8a = new Uint8Array(ab);

    // console.log(i, u8a);
    resolve({done, value: u8a, i});
    updatePromise();
});


const rs = new ReadableStream({
    async start(controller) {
        while (true) {
            const {done, value} = await promise;
            if (done) {
                break;
            }
            controller.enqueue(value);
        }
        controller.close();
    }
});

new Response(rs)
    .blob()
    .then(blob => {
        // console.log(blob);
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "GrimGrossKoodoo.mp4";
        a.click()
    });



// background.js:

chrome.runtime.onConnect.addListener(async function(port) {
    console.log(port);
    if (port.name === "demo-fetch") {
        let i = 0;
        const response = await fetch("https://giant.gfycat.com/GrimGrossKoodoo.mp4", {cache: "force-cache"});
        const reader = response.body.getReader();
        while (true) {
            const {done, value} = await reader.read(); // value is Uint8Array
            const blob = new Blob([value]);
            const url = URL.createObjectURL(blob)
            new Promise(resolve => setTimeout(resolve, 1000)).then(() => URL.revokeObjectURL(url));
            port.postMessage({
                done,
                value: url,
                i: i++
            });
            if (done) {
                break;
            }
        }
    }
});