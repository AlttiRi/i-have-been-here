<script setup lang="ts">
import {ref, toRaw, watch} from "vue";
import {isString} from "@alttiri/util-js";
import {getActiveTab} from "@/utils/util-ext";
import {getHash, iAmReady, waitMe} from "@/vue-pages/header/router";
import {getTabs} from "@/vue-pages/common";
import {defaultIgnore, filterUrls, ignoreFilter, logTabs, onlyFilter, updateHash} from "./core-tabs";
import {TabsRequest} from "@/common/types";
import Filters from "./Filters.vue";


const sp = new URLSearchParams(getHash());
onlyFilter.value   = sp.get("only")   || "";
ignoreFilter.value = sp.get("ignore") || defaultIgnore;
void updateHash();

const onTheRight = ref(false);

const allTabs = ref<chrome.tabs.Tab[]>([]);
const tabs    = ref<chrome.tabs.Tab[]>([]);
watch([onlyFilter, ignoreFilter, allTabs], filterTabs);
watch(onTheRight, fetchTabs);

function filterTabs() {
  tabs.value = allTabs.value.filter(tab => {
    return tab.url && filterUrls([tab.url]).length;
  });
  logTabs(tabs.value);
}

async function fetchTabs() {
  const query: TabsRequest = {
    extra: {
      sameWindow:    true,
      sameWorkspace: true,
      onTheRight:    onTheRight.value,
    }
  };
  allTabs.value = await getTabs(query);
  console.log(toRaw(allTabs.value));
}

waitMe();
void fetchTabs().then(iAmReady);

function getTitle(tab: chrome.tabs.Tab) {
  return (tab.title || "").replaceAll(`"`, "&quot;");
}

function getUrls(): string[] {
  return tabs.value?.map(tab => tab.url).filter(isString) || [];
}
function copyText() {
  const text = getUrls().join(" ");
  console.log(text);
  void navigator.clipboard.writeText(text);
}
function copyTextAsLines() {
  const text = getUrls().join("\n") + "\n";
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
  const LEFT_BUTTON   = 0;
  const MIDDLE_BUTTON = 1;
  const RIGHT_BUTTON  = 2;
  if (event.button !== MIDDLE_BUTTON) {
    return;
  }
  event.preventDefault();
  const target = event.target as Element;
  if (target.classList.contains("favicon")) {
    target.closest("tr")!.classList.remove("clicked");
  }
}

// todo: check tab's `workspaceId`
const currentTab = ref<chrome.tabs.Tab>();
getActiveTab()
  .then(tab => currentTab.value = tab)

chrome.tabs.onMoved.addListener((tabId: number, moveInfo: chrome.tabs.TabMoveInfo) => {
  if (onTheRight.value) {
    fetchTabs();
  }
  console.log(tabId, moveInfo);
  console.log(toRaw(currentTab.value));
});


</script>

<template>
  <div data-comp="TabsListPage" id="tabs-list" class="container">
    <div id="controls" class="row row-cols-lg-3 g-3 align-items-center">
      <Filters/>
      <div class="col-12">
        <button class="btn btn-primary mx-1" id="reload"
                :title="''"
                @click="fetchTabs"
        >🔄</button>
        <button class="btn btn-primary mx-1" id="copy-btn"
                :title="'Copy URLs\nCopy URLs as lines (RMB click)'"
                @click="copyText"
                @contextmenu.prevent="copyTextAsLines"
        >Copy</button>
        <span class="on-the-right mx-1">
          <label class="form-check-label btn btn-light" tabindex="-1"
                 title=""
          >
            <input type="checkbox"
                   class="form-check-input"
                   v-model="onTheRight"
                   :checked="onTheRight"
            >
            Only to right
          </label>
        </span>
      </div>
    </div>
    <hr>
    <div id="list-block" @click="addClicked" @mousedown="removeClicked">
      <table class="table table-borderless">
        <tbody id="list-content">
        <tr v-for="tab of tabs" :key="tab.id">
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
