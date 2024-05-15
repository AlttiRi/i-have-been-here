<script setup lang="ts">
import {ref, watch} from "vue";
import {GetTabsGS}  from "@/message-center";
import {getHash, iAmReady, waitMe} from "@/vue-pages/header/router";
import {defaultIgnore, filterUrls, ignoreFilter, logTabs, onlyFilter, updateHash} from "./core-tabs";
import Filters from "./Filters.vue";


const sp = new URLSearchParams(getHash());
onlyFilter.value   = sp.get("only")   || "";
ignoreFilter.value = sp.get("ignore") || defaultIgnore;
void updateHash();


const tabs = ref<chrome.tabs.Tab[]>();
const urls = ref<string[]>([]);
watch([onlyFilter, ignoreFilter], update);
async function update() {
  const _tabs = await GetTabsGS.get();
  const _tabs_filtered = _tabs.filter(tab => {
    return tab.url && filterUrls([tab.url]).length;
  });

  tabs.value = _tabs_filtered;
  logTabs(_tabs_filtered);
}

waitMe();
void update().then(iAmReady);

function getTitle(tab: chrome.tabs.Tab) {
  return (tab.title || "").replaceAll(`"`, "&quot;");
}

function copyText() {
  const text = urls.value.join(" ");
  console.log(text);
  void navigator.clipboard.writeText(text);
}



function addClicked(event: MouseEvent) {
  const target = event.target as Element;
  if (target.classList.contains("link-primary")) {
    target.closest("tr")!.classList.add("clicked");
  }
}
function removeClicked(event: MouseEvent) {
  const LEFT_BUTTON = 0;
  const MIDDLE_BUTTON = 1;
  const RIGHT_BUTTON = 2;
  if (event.button !== MIDDLE_BUTTON) {
    return;
  }
  event.preventDefault();
  const target = event.target as Element;
  if (target.classList.contains("favicon")) {
    target.closest("tr")!.classList.remove("clicked");
  }
}
</script>

<template>
  <div data-comp="TabsListPage" id="tabs-list" class="container">
    <div id="controls" class="row row-cols-lg-3 g-3 align-items-center">
      <Filters/>
      <div class="col-12">
        <button class="btn btn-primary" title="Copy URLs" id="copy-btn"
                @click="copyText"
        >Copy</button>
      </div>
    </div>
    <hr>
    <div id="list-block" @click="addClicked" @mousedown="removeClicked">
      <table class="table table-borderless">
        <tbody id="list-content">
        <tr v-for="tab of tabs">
          <td>
            <img class="favicon" :src="tab.favIconUrl || '/images/empty.png'" alt=""/>
            <a class="url link-primary"
               :title="getTitle(tab)"
               :href="tab.url"
               rel="noreferrer noopener" target="_blank" >{{ tab.url }}
            </a>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.favicon {
  height: 16px;
  width: 16px;
  user-select: none;
}
.url {
  padding-left: 8px;
}
a {
  text-decoration: none;
}
.input-page a.url:visited {
  color: darkorange;
}
tr.clicked {
  background-color: #0000000f;
}
</style>
