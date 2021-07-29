```js
/** @return {{canvas: HTMLCanvasElement, context: CanvasRenderingContext2D}} */
function emojiTo(emoji = "⬜", size = 64, multiplier = 1.01) {

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
    const y = size / 2 + Math.round(size - size * 0.925);

    context.fillText(emoji, x, y);

    return {canvas, context};
}

async function emojiToBlobURL(emoji, size, multiplier, revokeDelay = 100000) {
    const blob = await emojiToBlob(emoji, size, multiplier);
    const url = URL.createObjectURL(blob);
    // console.log(url, blob, await blob.arrayBuffer());
    setTimeout(_ => URL.revokeObjectURL(url), revokeDelay);
    return url;
}

await emojiToBlobURL("✅");

```
