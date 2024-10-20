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
         "web_accessible_resources/*"
     ],
*/
