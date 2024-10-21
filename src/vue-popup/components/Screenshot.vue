<script setup lang="ts">
import {sleep} from "@alttiri/util-js";
import {ref} from "vue";
import {JpgDataURL, logPicture}          from "@/util";
import {captureVisibleTab, getActiveTab} from "@/util-ext-bg";
import {TabCapture} from "@/types";
import {
  ChangeIconPS,
  DownloadScreenshotSS,
  LogScreenshotSS,
  SaveScreenshotES,
} from "@/message-center";
import {core} from "./core-popup";


const imageHeight = ref("auto");
const disabled = ref(true);
const image = ref({
  src: "",
  alt: "",
  data_tabUrl: "",
  data_date:   "",
});

let tabCapture: TabCapture | null = null;
updatePreview();
async function updatePreview(): Promise<void> {
  const tab: chrome.tabs.Tab | undefined = await getActiveTab();
  if (!tab) {
    console.log("[warning] no active tab available");
    return;
  }
  console.log("tab to capture:", tab);

  if (tab.height && tab.width) {
    imageHeight.value = 320 / tab.width * tab.height + "px";
  }

  core.value = tab;

  const date: number = Date.now();
  const screenshotUrl: JpgDataURL | null = await captureVisibleTab();
  if (screenshotUrl === null) {
    console.log("screenShotData === null");
    return;
  }

  void logPicture(screenshotUrl);
  image.value = {
    src: screenshotUrl,
    alt: "",
    data_tabUrl: tab.url || "",
    data_date: date.toString()
  };
  disabled.value = false; // todo retest

  tabCapture = {tab, screenshotUrl, date};

  // Firefox's popup's scrolls fix // todo retest
  await sleep(20);
  (document.querySelector("#image") as HTMLImageElement).alt = ""; // don't remove it!
}


async function updateScreenshot(event: PointerEvent) {
  if (event.buttons !== 1) {
    return;
  }
  await updatePreview();
  if (!tabCapture) {
    return;
  }
  LogScreenshotSS.send(tabCapture); // just to log the image in bg
}

const downloadSuccess      = ref(false);
const addScreenshotSuccess = ref(false);

async function downloadScreenshot() {
  if (!tabCapture) {
    return;
  }
  DownloadScreenshotSS.send(tabCapture);
  downloadSuccess.value = true;
  ChangeIconPS.ping();
  await sleep(500);
  downloadSuccess.value = false;
}

async function addScreenshot() {
  if (!tabCapture) {
    return;
  }
  const response: string = await SaveScreenshotES.exchange(tabCapture);
  console.log("saveScreenshot response:", response);
  addScreenshotSuccess.value = true;
}

</script>

<template>
  <div data-comp="Screenshot" class="card screenshot-part" style="position: relative">
    <div id="image-wrap"
         @pointerdown="updateScreenshot"
         :style="{
             height: imageHeight
           }">
      <img id="image"
           :alt="image.alt" :src="image.src"
           class="img-thumbnail"
           :data-date="image.data_date"
           :data-tabUrl="image.data_tabUrl">
    </div>
    <div class="card-body pointer-event-off"
         style="position: absolute; width: 100%;"
    >
      <div class="float-start pointer-event-off" style="background-color: inherit;">
        <button
          id="restoreScreenshotBtn"
          title="Restore the saved bookmark' screenshot"
          class="btn btn-secondary pointer-event-on hidden"
          style="height: 38px; padding: 0"
        >
          <svg
            style="color: inherit; height: inherit; width: inherit;"
            width="64px" height="64px" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M14.3935 5.37371C18.0253 6.70569 19.8979 10.7522 18.5761 14.4118C17.6363 17.0135 15.335 18.7193 12.778 19.0094M12.778 19.0094L13.8253 17.2553M12.778 19.0094L14.4889 20M9.60651 18.6263C5.97465 17.2943 4.10205 13.2478 5.42394 9.58823C6.36371 6.98651 8.66504 5.28075 11.222 4.99059M11.222 4.99059L10.1747 6.74471M11.222 4.99059L9.51114 4"/>
          </svg>
        </button>
      </div>
      <div id="screenshotControls" class="float-end pointer-event-on" style="background-color: inherit;">
        <button
          id="downloadScreenshotBtn"
          title="Download the screenshot"
          class="btn btn-primary mb-1"
          style="min-width: 100px;"
          :disabled="disabled"
          :class="{
            'btn-outline-success': downloadSuccess
          }"
          @click="downloadScreenshot"
        >Download</button>
        <br>
        <button
          id="addScreenshotBtn"
          title="Add the screenshot to the screenshots list"
          class="btn btn-primary"
          style="min-width: 100px;"
          :disabled="disabled"
          :class="{
            'btn-success': addScreenshotSuccess
          }"
          @click="addScreenshot"
        >Save{{addScreenshotSuccess ? "d" : ""}}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border-left: 0;
  border-right: 0;
}
#image-wrap {
  overflow: hidden;
}
.screenshot-part:not(:hover) button {
  opacity: 0;
  pointer-events: none;
}
#screenshotControls:not(:hover) #addScreenshotBtn {
  opacity: 0;
  pointer-events: none;
}
.img-thumbnail {
  padding: 0;
  border-radius: 0;
  border: 0;
}
</style>
