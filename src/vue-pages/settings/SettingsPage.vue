<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref, watch, watchEffect} from "vue";
import {TitleCleaner} from "@alttiri/string-magic";
import TitleCleanerConfig from "./TitleCleanerConfig.vue";
import {getTab, manifest} from "@/utils/util-ext";
import {LastTabsGetting}  from "@/common/message-center";
import {
  commonSettings,
  dlShelf,
  filenameLengthLimit,
  quickAccessUrl,
  tcCompiledRules,
  urlOpenerMode,
} from "@/common/reactive-store";
import {exportStore, importStore, wipeStore} from "./storage-backup";


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
  const tabs = await LastTabsGetting.get();
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
});

const cleaner = ref<TitleCleaner>();
watchEffect(() => {
  if (!tcCompiledRules.isReady) {
    return;
  }
  cleaner.value = TitleCleaner.fromRuleRecords(tcCompiledRules.value);
});
watchEffect(() => {
  if (!cleaner.value) {
    return;
  }
  lATCleanedTitle.value = cleaner.value.clean(lastActiveTab.value?.url || "", lastActiveTab.value?.title || "");
});


const browserName = ref("");
commonSettings.onReady.then(() => {
  browserName.value = commonSettings.value.browserName;
  watch(browserName, value => {
    void commonSettings.setValue({
      ...commonSettings.value,
      browserName: value,
    });
  });
});

const exported    = ref(false);
const safeStorage = ref(true); // todo? make persistent


const contentLogExtName = computed(() => {
  return "Content: Log Extension Name " + (commonSettings.value.contentLogExtName ? "✅" : "⬜");
});
function toggleContentLogExtName() {
  return commonSettings.setValue({
    ...commonSettings.value,
    contentLogExtName: !commonSettings.value.contentLogExtName,
  });
}
const contentLogScreenshotText = computed(() => {
  return "Content: Log Screenshot " + (commonSettings.value.contentLogScreenshot ? "✅" : "⬜");
});
function toggleContentLogScreenshot() {
  return commonSettings.setValue({
    ...commonSettings.value,
    contentLogScreenshot: !commonSettings.value.contentLogScreenshot,
  });
}
</script>

<template>
  <div data-comp="SettingsPage" id="settings" class="container">
    <div class="options">
      <h4>Options</h4>
      <button id="download-shelf" class="btn m-3" @click="toggleDlShelf">{{dlShelfBtnText}}</button>
      <button id="url-opener-mode" class="btn m-3" @click="toggleUrlOpenerMode">{{urlOpenerModeBtnText}}</button>
    </div>
    <hr>
    <div class="filename-length-limit">
      <label style="display: contents">
        <h4>Filename length limit</h4>
        <input id="filename-length-limit" class="form-control"
               type="number"
               v-model="filenameLengthLimit.value"
        >
      </label>
    </div>
    <hr>
    <div class="quick-access-url">
      <label style="display: contents">
        <h4>Quick access URL</h4>
        <input id="quick-url" class="form-control"
               type="text"
               v-model="quickAccessUrl.value"
               :title="quickUrlInputTitle"
        >
      </label>
    </div>
    <hr>
    <TitleCleanerConfig/>
    <hr>
    <div class="title-cleaner-preview">
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
        <hr>
      </div>
    </div>
    <div class="storage-controls">
      <h4>Entire storage export (+ browser name) / import / wipe</h4>
      <button id="export-store"
              class="btn m-2 btn-outline-primary"
              @click="() => exportStore(browserName).then(() => exported = true)"
              title="Export the entire storage of the extension"
      >Export Store</button>
      <span class="browser-name-wrap btn">
      <label><input type="text" v-model="browserName" class="form-control" title="Browser name"></label>
    </span>
      <button id="import-store"
              class="btn m-2 btn-outline-danger"
              @click="importStore"
              :disabled="safeStorage && !exported"
              title="WARNING: it will overwrite the extension's data"
      >Import Store</button>
      <button id="wipe-store"
              class="btn m-2 btn-outline-danger"
              @click="wipeStore"
              :disabled="safeStorage && !exported"
              title="WARNING: it will delete the extension's all data"
      >Wipe Store</button>
      <span class="safe-storage">
        <label class="form-check-label btn btn-light" tabindex="-1"
               title="Allows to import / wipe the storage only after exporting"
        >
          <input type="checkbox"
                 class="form-check-input"
                 v-model="safeStorage"
                 :checked="safeStorage"
          >
          Safe
        </label>
      </span>
    </div>
    <hr>

    <div class="extra-options">
      <h4>Extra Options</h4>
      <button class="btn m-3" @click="toggleContentLogExtName">{{contentLogExtName}}</button>
      <button class="btn m-3" @click="toggleContentLogScreenshot">{{contentLogScreenshotText}}</button>
    </div>
    <hr>

    <div class="ext-version">
      <pre :title="`${manifest.name}'s version`">{{manifest.version}}</pre>
    </div>
    <hr>
  </div>
</template>

<style>
.ext-version {
  color: grey;
}
.title-cleaner-preview .note {
  color: grey;
  opacity: 0.5;
}

.form-check .form-check-input {
  float: none;
  margin-left: 0;
}
</style>
