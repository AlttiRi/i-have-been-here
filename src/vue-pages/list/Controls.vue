<script setup lang="ts">
import {downloadBlob, fullUrlToFilename, sleep}  from "@/util";
import {getFromStoreLocal, removeFromStoreLocal} from "@/util-ext";
import {exportVisits, importVisits} from "@/bg/visits";
import {toArrayBuffer}              from "@/bg/image-data";
import {ScreenshotInfo} from "@/types";


defineProps<{
  activePage: "visits" | "screens"
}>();

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
</script>

<template>
  <div data-comp="Controls" id="controls">
    <div v-if="activePage === 'visits'" class="d-flex flex-row-reverse ">
      <label class="btn btn-outline-primary m-2">
        <input type="file" accept="application/json" style="display: none"
               @change="importVisitsListener"
        >Import visits
      </label>
      <button class="btn btn-outline-primary m-2" id="export-visits"
              @click="exportVisits"
      >Export visits
      </button>
    </div>
    <div v-if="activePage === 'screens'" class="d-flex flex-row-reverse ">
      <button class="btn btn-outline-danger m-2" id="delete-images"
              @click="deleteImages"
      >Delete images</button>
      <button class="btn btn-outline-primary m-2" id="export-images"
              @click="exportImages"
      >Export images</button>
    </div>
    <hr>
  </div>
</template>

<style scoped>
.btn {
  width: 130px;
}
</style>
