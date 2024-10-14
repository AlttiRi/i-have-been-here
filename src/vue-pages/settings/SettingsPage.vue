<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref, watchEffect} from "vue";
import {TitleCleaner} from "@alttiri/string-magic";
import TitleCleanerConfig from "./TitleCleanerConfig.vue";
import {manifest} from "@/util-ext";
import {getTab}   from "@/util-ext-bg";
import {GetLastTabsGS} from "@/message-center";
import {
  dlShelf,
  filenameLengthLimit,
  quickAccessUrl,
  tcCompiledRules,
  urlOpenerMode
} from "@/bg/store/store";


const dlShelfBtnText = computed(() => {
  return "Download shelf " + (dlShelf.value ? "✅" : "⬜");
});
async function toggleDlShelf() {
  await dlShelf.setValue(!dlShelf.value);
}

const urlOpenerModeBtnText = computed(() => {
  return "Quick URL opener mode " + (urlOpenerMode.value ? "✅" : "⬜");
});
async function toggleUrlOpenerMode() {
  await urlOpenerMode.setValue(!urlOpenerMode.value);
}

const quickUrlInputTitle = computed(() => {
  return new URL(quickAccessUrl.value, location.origin).href;
});
watchEffect(() => {
  if (quickAccessUrl.value === " ") {
    quickAccessUrl.value = quickAccessUrl.defaultValue;
  }
});


const lastActiveTab   = ref<chrome.tabs.Tab | null>(null);
const lATCleanedTitle = ref<string>("");

async function getLastActiveTab() {
  const tabs = await GetLastTabsGS.get();
  lastActiveTab.value = tabs[tabs.length - 2];
  if (!lastActiveTab.value || !lastActiveTab.value.id) {
    return;
  }
  lastActiveTab.value = await getTab(lastActiveTab.value.id);
}

onMounted(() => {
  void getLastActiveTab();
  window.addEventListener("focus", getLastActiveTab);
});
onBeforeUnmount(() => {
  window.removeEventListener("focus", getLastActiveTab);
})

watchEffect(() => {
  if (!tcCompiledRules.ref.value) { // seems no need
    console.warn("!tcCompiledRules.ref.value");
    return;
  }
  const cleaner = TitleCleaner.fromRuleRecords(tcCompiledRules.ref.value);
  lATCleanedTitle.value = cleaner.clean(lastActiveTab.value?.url || "", lastActiveTab.value?.title || "");
});
</script>

<template>
  <div data-comp="SettingsPage" id="settings" class="container">
    <h4>Options</h4>
    <button id="download-shelf" class="btn m-3" @click="toggleDlShelf">{{dlShelfBtnText}}</button>
    <button id="url-opener-mode" class="btn m-3" @click="toggleUrlOpenerMode">{{urlOpenerModeBtnText}}</button>
    <hr>
    <label style="display: contents">
      <h4>Filename length limit</h4>
      <input id="filename-length-limit" class="form-control"
             type="number"
             v-model="filenameLengthLimit.value"
      >
    </label>
    <hr>
    <label style="display: contents">
      <h4>Quick access URL</h4>
      <input id="quick-url" class="form-control"
             type="text"
             v-model="quickAccessUrl.value"
             :title="quickUrlInputTitle"
      >
    </label>
    <hr>
    <TitleCleanerConfig/>
    <div v-if="lastActiveTab">
      <h5>Title Cleaner preview (for <span :title="lastActiveTab.url">the last active tab</span>'s title)</h5>
      <div class="original" title="original">{{lastActiveTab.title || "&nbsp;"}}</div>
      <div class="cleaned" title="cleaned">{{lATCleanedTitle || "&nbsp;"}}</div>
      <div class="note">
        <div v-if="lATCleanedTitle === lastActiveTab.title">
          <span>No changes.</span>
        </div>
        <div v-else-if="lastActiveTab.title && lATCleanedTitle === ''">
          Cleaned (empty).
        </div>
        <div v-else>
          <span>Cleaned.</span>
        </div>
      </div>
    </div>
    <hr>
    <pre class="ext-version" :title="`${manifest.name}'s version`">{{manifest.version}}</pre>
  </div>
</template>

<style>
.ext-version {
  color: grey;
}
.note {
  color: grey;
  opacity: 0.5;
}
</style>
