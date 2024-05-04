<template>
  <ListAsync/>
</template>

<script setup lang="ts">
import {defineAsyncComponent} from "vue";
import {prependCss} from "@/util";


const cssReady = prependCss("/libs/bootstrap.css", "sha256-o+AsfCHj7A1M5Xgm1kJmZiGEIvMQEzQqrXz2072Gkkg=");

const ListComp = import("./components/List.vue");
const ListAsync = defineAsyncComponent(async () => {
  try {
    await cssReady;
  } catch (e) {
    console.error(e, e.href);
  }
  return ListComp;
});
</script>
