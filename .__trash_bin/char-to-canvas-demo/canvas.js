console.log("canvas");
const body = document.querySelector("body");
const input = document.querySelector("input");
input.value = "✅";

let blob;

input.addEventListener("keypress", async /** @type {KeyboardEvent} */ event => {
    console.log(event);
    if (event.key !== "Enter") {
        return;
    }

    const {value} = event.target;
    console.log("value:", value);

    const {canvas} = emojiTo(value, 128);
    body.append(canvas);

    const url = await emojiToBlobURL(value, 128);
    console.log(url);

    logPicture(url);


    blob = await emojiToBlob(value, 128);
});



async function blobUrlToDataUrl(blobUrl) {
    const response = await fetch(blobUrl);
    const blob = await response.blob()
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.readAsDataURL(blob);
    });
}

function isBlobUrl(url) {
    return url.toString().startsWith("blob:");
}

async function logPicture(url, scale = 0.5) {
    let dataUrl;
    if (isBlobUrl(url)) {
        dataUrl = await blobUrlToDataUrl(url);
    } else {
        dataUrl = url;
    }

    const img = new Image();
    const imageLoaded = new Promise(resolve => img.onload = resolve);
    img.src = dataUrl;
    await imageLoaded;

    console.log("%c ", `
       padding: ${Math.floor(img.height * scale / 2)}px ${Math.floor(img.width * scale / 2)}px;
       background: url("${img.src}");
       background-size: ${img.width * scale}px ${img.height * scale}px;
       font-size: 0;
    `);
}

function emojiToImageData(emoji, size, multiplier) {
    const {context} = emojiTo(emoji, size, multiplier);
    return context.getImageData(0, 0, size, size);
}

function emojiToBlob(emoji, size , multiplier) {
    const {canvas} = emojiTo(emoji, size, multiplier);
    return new Promise(resolve => canvas.toBlob(resolve));
}

function emojiToDataURL(emoji, size, multiplier) {
    const {canvas} = emojiTo(emoji, size, multiplier);
    const dataUrl = canvas.toDataURL("png", 100);
    console.log(dataUrl);
    return dataUrl;
}

async function emojiToBlobURL(emoji , size, multiplier, revokeDelay = 100000) {
    const blob = await emojiToBlob(emoji, size, multiplier);
    console.log(await blob.arrayBuffer());
    const url = URL.createObjectURL(blob);
    console.log(url, blob);
    setTimeout(_ => URL.revokeObjectURL(url), revokeDelay);
    return url;
}

function emojiTo(emoji = "⬜", size = 64, multiplier = 0.96) {
    /** @type {HTMLCanvasElement} */
    const canvas = document.createElement("canvas");

    canvas.width  = size;
    canvas.height = size;
    /** @type {CanvasRenderingContext2D} */
    const context = canvas.getContext("2d");

    context.font = size * 0.875 * multiplier + "px serif";
    context.textBaseline = "middle";
    context.textAlign = "center";

    const x = size / 2;
    const y = size / 2 + Math.round(size - size * 0.925); // "(size - size * 0.925) / 2"   if firefox

    context.fillText(emoji, x, y);

    return {canvas, context};
}