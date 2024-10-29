console.log("👾", `from "web_accessible_resources/test.js"`);

/*
// to test it //

document.querySelector("body")
    .append((function(){
        const s = document.createElement("script");
        s.type = "module";
        s.src = `chrome-extension://ljjoafkhpecgfpppmbkenhojmcilpmgp/web_accessible_resources/test.js`;
        return s;
    })());

*/

/*
     "web_accessible_resources": [
         "web_accessible_resources/*",
         "src/content/*"
     ],

     "src/content/*" is to prevent:
     Denying load of chrome-extension://ljjoafkhpecgfpppmbkenhojmcilpmgp/src/content/content--log-ext-name.js.
     Resources must be listed in the web_accessible_resources manifest key in order to be loaded by pages outside the extension.
*/
