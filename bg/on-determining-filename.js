// https://developer.chrome.com/extensions/downloads#event-onDeterminingFilename
// chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
//     //console.log(item, suggest);
//     if (item.byExtensionId) {
//         suggest();
//         return;
//     }
//
//     const url = item.finalUrl;
//     if (new URL(url).host === "litter.catbox.moe") {
//         // "https://litter.catbox.moe/0l7wc9.7z"
//         suggest({
//             filename: "[litter.catbox.moe] " + item.filename,
//             conflict_action: "uniquify"
//         });
//     } else {
//         console.log("skip");
//         suggest({
//             filename: item.filename,
//             conflict_action: "uniquify"
//         });
//     }
//
//     // let newFileName;
//     // if (item.filename.indexOf("'") > -1) {
//     //     newFileName = item.filename.replace(/'/g, '')
//     // }
//     // suggest({
//     //     filename: "newFileName",
//     //     conflict_action: 'uniquify'
//     // });
// });

// const blob = new Blob(["test text"], {type: "text/plain"});
// const url = URL.createObjectURL(blob);
// chrome.downloads.download({
//     url,
//     filename: "test.txt",
//     //saveAs: true,
// });