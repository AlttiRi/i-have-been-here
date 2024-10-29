<template>
  <PopupAsync/>
</template>

<script setup lang="ts">
import {defineAsyncComponent} from "vue";
import {prependCss} from "@/utils/util";


const cssReady = prependCss("/libs/bootstrap.css");

const PopupComp = import("./components/Popup.vue");
const PopupAsync = defineAsyncComponent(async () => {
  try {
    await cssReady;
  } catch (e) {
    console.error(e, e.href);
  }
  return PopupComp;
});

// import PopupAsync from "./components/Popup.vue";
//
// chrome-extension://ljjoafkhpecgfpppmbkenhojmcilpmgp/bundle/pages/popup.html
/*
 <link rel="stylesheet" href="../libs/bootstrap.css" integrity="sha256-o+AsfCHj7A1M5Xgm1kJmZiGEIvMQEzQqrXz2072Gkkg=" crossorigin="anonymous">
*/
</script>
