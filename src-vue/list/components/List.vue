<script setup lang="ts">
import {onMounted, ref} from "vue";
import {toArrayBuffer}         from "@/src/bg/image-data";
import {ScreenshotInfo, Visit} from "@/src/types";
import {exportVisits, getVisits, importVisits}   from "@/src/bg/visits";
import {getFromStoreLocal, removeFromStoreLocal} from "@/src/util-ext";
import {downloadBlob, fullUrlToFilename, sleep}  from "@/src/util";

import Header         from "./Header.vue";
import VisitItem      from "./VisitItem.vue";
import ScreenshotItem from "./ScreenshotItem.vue";


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



async function importVisitsListener(event: Event) {
  const inputElement = event.currentTarget as HTMLInputElement;
  const file: File = inputElement.files![0];
  console.log(file);
  const array = JSON.parse(await file.text());
  await importVisits(array);
}

async function deleteImages(event: MouseEvent) {
  const button = event.currentTarget as HTMLButtonElement;
  button.setAttribute("disabled", "");
  await removeImages();
  button.removeAttribute("disabled");
}

async function removeImages(): Promise<void> {
  const screenshots: ScreenshotInfo[] = await getFromStoreLocal("screenshots") || [];
  const promises: Promise<unknown>[] = [];
  for (const screenshot of screenshots) {
    promises.push(removeFromStoreLocal(screenshot.scd_id));
  }
  await Promise.all(promises);
}

async function exportImages() {
  const screenshots: ScreenshotInfo[] = await getFromStoreLocal("screenshots") || [];
  for (const screenshot of screenshots) {
    const base64 = await getFromStoreLocal(screenshot.scd_id);
    const ab = toArrayBuffer(base64);
    const blob = new Blob([ab], {type: "image/jpeg"});
    const urlFilename = fullUrlToFilename(screenshot.url);
    const name = `[ihbh]${urlFilename}.jpg`;
    downloadBlob(blob, name, screenshot.url);
    await sleep(125);
    console.log(name, screenshot.url);
  }
}

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
    <div class="container" id="controls">
      <button class="btn btn-outline-primary m-2" id="export-visits"
              @click="exportVisits"
      >Export visits
      </button>
      <label class="btn btn-outline-primary m-2">
        <input type="file" accept="application/json" style="display: none"
               @change="importVisitsListener"
        >Import visits
      </label>
      <button class="btn btn-outline-primary m-2 ms-md-5" id="export-images"
              @click="exportImages"
      >Export images</button>
      <button class="btn btn-outline-danger m-2" id="delete-images"
              @click="deleteImages"
      >Delete images</button>
    </div>
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
a:visited {
  color: #0a53be;
}
a {
  text-decoration: none;
}
</style>
