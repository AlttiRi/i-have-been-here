<template>
  <PopupAsync/>
</template>

<script setup lang="ts">
// import PopupAsync from "./components/Popup.vue";

const cssReady = prependCss("../libs/bootstrap.css", "sha256-o+AsfCHj7A1M5Xgm1kJmZiGEIvMQEzQqrXz2072Gkkg=");
const PopupComp = import("./components/Popup.vue");
import {defineAsyncComponent} from "vue";
const PopupAsync = defineAsyncComponent(async () => {
  await cssReady;
  return PopupComp;
});

// chrome-extension://llbhojonnafjopkkokcjhomnceajcdmh/dist-popup/index.html
// chrome-extension://llbhojonnafjopkkokcjhomnceajcdmh/src/pages/popup.html
/*
 <link rel="stylesheet" href="../libs/bootstrap.css" integrity="sha256-o+AsfCHj7A1M5Xgm1kJmZiGEIvMQEzQqrXz2072Gkkg=" crossorigin="anonymous">
*/

function prependCss(href: string, integrity?: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.onload = resolve;
    link.onerror = event => reject({message: "Failed to load css", href, integrity, event});
    link.href = href;
    if (integrity) {
      link.integrity = integrity;
      link.crossOrigin = "anonymous";
    }
    const firstLink = document.head.querySelector(`link[rel="stylesheet"]`);
    if (firstLink) {
      firstLink.before(link);
    } else {
      document.head.prepend(link);
    }
  });
}
</script>
