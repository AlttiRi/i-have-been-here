<script setup lang="ts">
import {onMounted, ref} from "vue";
import {ScreenshotInfo, Visit} from "@/types";
import {getVisits}         from "@/bg/visits";
import {getFromStoreLocal} from "@/util-ext";
import {sleep}             from "@/util";

import Header         from "./Header.vue";
import VisitItem      from "./VisitItem.vue";
import ScreenshotItem from "./ScreenshotItem.vue";
import Controls       from "./Controls.vue";


const visits = ref<Visit[]>([]);
getVisits().then(value => {
  visits.value = value;
  console.log("Visits:", value);
});

const screenshots = ref<ScreenshotInfo[]>([]);
getFromStoreLocal("screenshots").then(value => {
  screenshots.value = value || [];
  console.log("Screenshots:", value);
});


onMounted(async function scrollToHash() {
  const hash = location.hash;
  if (!hash) {
    return;
  }
  if (location.hash === "#null") {
    location.hash = "";
    return;
  }
  await sleep(0);
  location.hash = "";
  location.hash = hash;
});
</script>

<template>
  <div data-comp="List" id="list">
    <Header/>
    <hr>
    <Controls/>
    <hr>
    <div id="visits">
      <VisitItem v-for="visit of visits" :visit/>
    </div>
    <div id="screenshots">
      <ScreenshotItem v-for="screenshot of screenshots" :screenshot/>
    </div>
    <hr>
  </div>
</template>

<style>

</style>
