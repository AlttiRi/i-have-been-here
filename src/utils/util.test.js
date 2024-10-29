import {Tester} from "@alttiri/util-node-js";
import {fullUrlToFilename} from "./util.ts";

const {eq, report} = new Tester().destructible();

eq("ab0", fullUrlToFilename("  about:addons  "),          "[about·addons]");
eq("ab1", fullUrlToFilename("about:addons"),              "[about·addons]");
eq("ab2", fullUrlToFilename("about:addons/"),             "[about·addons]");
eq("ab3", fullUrlToFilename("about:addons/?"),            "[about·addons]");
eq("ab4", fullUrlToFilename("about:addons/?#"),           "[about·addons]");
eq("ab5", fullUrlToFilename("about:addons/xxx/yyy"),      "[about·addons] xxx·yyy");
eq("ab6", fullUrlToFilename("about:addons/xxx/yyy/"),     "[about·addons] xxx·yyy");
eq("ab7", fullUrlToFilename("about:addons/xxx/yyy//"),    "[about·addons] xxx·yyy");
eq("ab8", fullUrlToFilename("about:addons/xxx/yyy//?"),   "[about·addons] xxx·yyy");
eq("ab9", fullUrlToFilename("about:addons/xxx/yyy//?#"),  "[about·addons] xxx·yyy");

eq("mz1", fullUrlToFilename("moz-extension://6c7afaa1-191c-4c41-b65c-8cfd2880104c/"),              "[moz-extension·6c7afaa1-191c-4c41-b65c-8cfd2880104c]");
eq("mz1", fullUrlToFilename("moz-extension://6c7afaa1-191c-4c41-b65c-8cfd2880104c/manifest.json"), "[moz-extension·6c7afaa1-191c-4c41-b65c-8cfd2880104c] manifest.json");
eq("cr1", fullUrlToFilename("chrome-extension://cjpalhdlnbpafiamejdnhcphjbkeiagm/dashboard.html#about.html"), "[chrome-extension·cjpalhdlnbpafiamejdnhcphjbkeiagm] dashboard.html#about.html");

eq("cr2", fullUrlToFilename("chrome://flags/"),               "[chrome·flags]");
eq("cr2", fullUrlToFilename("chrome://extensions/"),          "[chrome·extensions]");
eq("cr3", fullUrlToFilename("chrome-error://chromewebdata/"), "[chrome-error·chromewebdata]");

eq("ftp", fullUrlToFilename("ftp://192.168.1.1"),   "[ftp·192.168.1.1]");

eq("s1", fullUrlToFilename("https://example.com"),      "[example.com]");
eq("s2", fullUrlToFilename("https://example.com/"),     "[example.com]");
eq("s2", fullUrlToFilename("https://www.example.com/"), "[example.com]");

eq("lt1", fullUrlToFilename("https://example.com/привет"), "[example.com] привет");
eq("lt2", fullUrlToFilename("https://example.com/%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82"), "[example.com] привет");
// eq("3lt", fullUrlToFilename("https://xn--j1ay.xn--p1ai/"), "[кц.рф]"); // Punycode

eq("pth", fullUrlToFilename("https://example.com/xxx/yyy"),  "[example.com] xxx·yyy");
eq("srh", fullUrlToFilename("https://example.com/?xxx=a"),   "[example.com]  xxx=a");
eq("srh", fullUrlToFilename("https://example.com?xxx=a"),    "[example.com]  xxx=a");
eq("srh", fullUrlToFilename("https://example.com/?xxx=a#a"), "[example.com]  xxx=a#a");
eq("hss", fullUrlToFilename("https://example.com/#aaa"),     "[example.com] #aaa");
eq("hss", fullUrlToFilename("https://example.com/#?aaa"),    "[example.com] #%3Faaa");

eq("mtp1", fullUrlToFilename("https://example.com/xxx/yyy#aaa"), "[example.com] xxx·yyy#aaa");
eq("mtp2", fullUrlToFilename("https://example.com/xxx/yyy/?aaa=aaa"), "[example.com] xxx·yyy· aaa=aaa");
eq("mtp3", fullUrlToFilename("https://example.com/xxx/yyy?aaa=aaa"),  "[example.com] xxx·yyy aaa=aaa");

eq("12", fullUrlToFilename("https://example.com/?xxx=a&xx=aa&x=aaa"),        "[example.com]  xxx=a&xx=aa&x=aaa");
eq("13", fullUrlToFilename("https://example.com/?xxx=https://example.com/"), "[example.com]  xxx=https%3A··example.com");
eq("13", fullUrlToFilename("https://example.com/?xxx=https://example.com"),  "[example.com]  xxx=https%3A··example.com");

eq("14", fullUrlToFilename("https://example.com/?xxx=https://example.com/#123??454"),               "[example.com]  xxx=https%3A··example.com·#123%3F%3F454");
eq("15", fullUrlToFilename("https://example.com/?xxx=https%3A%2F%2Fexample.com%2F#123%3F%3F454"),   "[example.com]  xxx=https%3A··example.com·#123%3F%3F454");
eq("15", fullUrlToFilename("https://example.com/?xxx=https%3A%2F%2Fexample.com%2F%23123%3F%3F454"), "[example.com]  xxx=https%3A··example.com·%23123%3F%3F454");

eq("16", fullUrlToFilename("https://example.com/?search=red+hat+sun"),       "[example.com]  search=red+hat+sun");
eq("17", fullUrlToFilename("https://example.com/?search=red+hat%20sun"),     "[example.com]  search=red+hat+sun");
eq("18", fullUrlToFilename("https://example.com/?search=red%20hat%20sun"),   "[example.com]  search=red+hat+sun");
eq("19", fullUrlToFilename("https://example.com/?search=red+~hat+~cap+sun"), "[example.com]  search=red+~hat+~cap+sun");

eq("x1", fullUrlToFilename("https://example.com/?search=·"), "[example.com]  search=%C2%B7");

eq("20", fullUrlToFilename("https://example.com/forum/index.php?media/users/user.12345/"),      "[example.com] forum·index.php media·users·user.12345");
eq("21", fullUrlToFilename("https://example.com/forum/index.php?media/albums/album-name.123/"), "[example.com] forum·index.php media·albums·album-name.123");

eq("22", fullUrlToFilename("https://example.com/index.php?page=post&s=list&tags=example"), "[example.com] index.php page=post&s=list&tags=example");

// todo: replace (optionally) "~" with "%7E" since Chrome replaces `~` with `_` on auto file downloading

eq("#1", fullUrlToFilename("https://example.com/#~"),   "[example.com] #~");
eq("#2", fullUrlToFilename("https://example.com/#—"),   "[example.com] #—");
eq("#3", fullUrlToFilename("https://example.com/##"),   "[example.com] ##");
eq("#4", fullUrlToFilename("https://example.com/###"),  "[example.com] ###");
eq("#5", fullUrlToFilename("https://example.com/#·"),   "[example.com] #%C2%B7");
eq("#6", fullUrlToFilename("https://example.com/#/a"),  "[example.com] #·a");
eq("#7", fullUrlToFilename("https://example.com/#/a/"), "[example.com] #·a");
eq("#8", fullUrlToFilename("https://mega.nz/folder/abSRE#abSREabSRE/folder/abSRE/"), "[mega.nz] folder·abSRE#abSREabSRE·folder·abSRE");


eq(".1", fullUrlToFilename("https://example.com/·"),        "[example.com] %C2%B7");
eq(".2", fullUrlToFilename("https://example.com/·/"),       "[example.com] %C2%B7");
eq(".3", fullUrlToFilename("https://example.com/·/%C2%B7"), "[example.com] %C2%B7·%C2%B7");
eq(".4", fullUrlToFilename("https://example.com/%C2%B7/"),  "[example.com] %C2%B7");
eq(".5", fullUrlToFilename("https://example.com/%C2%B7·/"), "[example.com] %C2%B7%C2%B7");


eq("/1", fullUrlToFilename("https://example.com/%2F"),      "[example.com] %2F");
eq("/2", fullUrlToFilename("https://example.com/%2F/"),     "[example.com] %2F");


eq("f:", fullUrlToFilename("file:///C:/Downloads/Telegram%20Desktop/messages.html"),
    "[file·C] Downloads·Telegram%20Desktop·messages.html");
eq("f/", fullUrlToFilename("file:///Downloads/Telegram%20Desktop/messages.html"),
                            "[file] Downloads·Telegram%20Desktop·messages.html");

eq("fl", fullUrlToFilename("file:///"),      "[file]");
eq("fl", fullUrlToFilename("file:////"),     "[file]");
eq("fl", fullUrlToFilename("file:///C/"),    "[file] C");
eq("fw", fullUrlToFilename("file:///C:"),    "[file·C]");
eq("fw", fullUrlToFilename("file:///C:/"),   "[file·C]");
eq("fw", fullUrlToFilename("file:///C:/C"),  "[file·C] C");
eq("fw", fullUrlToFilename("file:///C:/C:"), "[file·C] C%3A");

eq("fw", fullUrlToFilename("https://www.windy.com/?44.444,22.222,5"), "[windy.com]  44.444,22.222,5");
eq("fw", fullUrlToFilename("https://www.windy.com/#44.444,22.222,5"), "[windy.com] #44.444,22.222,5");


report();
