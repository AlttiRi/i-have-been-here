console.log("from web_accessible_resources/test.js");
/*
// to test it //

document.querySelector("body")
    .append((function(){
        const s = document.createElement("script");
        s.type = "module";
        s.src = `chrome-extension://gjcpkeofcjdjkhafgomjpcpoplngijlp/web_accessible_resources/test.js`;
        return s;
    })());


//     "web_accessible_resources": [
//         "src/web_accessible_resources/*",
//         "src/content.js",
//         "src/util-ext.js",
//         "src/util.js"
//     ],
*/
