<script setup lang="ts">
import {Ref, ref, watchEffect} from "vue";
import {localDateTime}         from "@alttiri/util-js";
import {quickAccessUrl}     from "@/bg/shared/store";
import {openQuickAccessUrl} from "@/bg/shared/common";
import {AddVisitGS, GetVisitGS}  from "@/message-center";
import {createBackgroundTab}     from "@/util-ext-bg";
import {Visit}     from "@/types";
import {PagePaths} from "@/page-paths";

import SvgOpenInNewTab from "./SvgOpenInNewTab.vue";
import SvgReload       from "./SvgReload.vue";


watchEffect(() => {
  console.log("watchEffect", quickAccessUrl.value);
});

const homeIsActive = ref(false);
watchEffect(() => {
  if (quickAccessUrl.value) {
    homeIsActive.value = true;
  }
});

const visit: Ref<Visit | null> = ref(null);
GetVisitGS.get().then(value => visit.value = value);
async function addVisit()  {
  visit.value = await AddVisitGS.get();
}

function openVisits() {
  createBackgroundTab(chrome.runtime.getURL(PagePaths.list_visits));
}

function visitToButtonTitle(visit: Visit): string {
  return [visit.created, visit.lastVisited]
    .filter((d): d is number => d !== undefined)
    .map(ms => localDateTime(ms))
    .join("\n");
}

</script>

<template>
  <div data-comp="TopControls" class="card top-part" style="min-height: 38px;">
    <div class="card-body">
      <button
        id="openQuickAccessUrlBtn"
        :title="`Open the quick access url:\n${quickAccessUrl.value}`"
        :data-url="quickAccessUrl.value"
        class="btn btn-outline-primary"
        :class="{ 'hidden': !homeIsActive }"
        @click="openQuickAccessUrl"
      >Home</button>
      <div style="display: contents">

        <div class="float-end" id="visitControls">
          <button
            id="toggleToBookmarksBtn"
            title="Toggle to bookmarks"
            class="btn btn-outline-secondary hidden"
            style="height: 38px; padding: 0"
          ><SvgReload/></button>
          <button
            id="openVisitsBtn"
            title="Open visits"
            class="btn btn-outline-secondary me-1"
            style="height: 38px; padding: 0"
            @click="openVisits"
          ><SvgOpenInNewTab/></button>
          <button
            id="addVisitBtn"
            :title="visit ? visitToButtonTitle(visit) :`Add the page to the visited list`"
            :class="{ 'btn-outline-success': visit }"
            @click="addVisit"
            class="btn btn-outline-primary"
            style="min-width: 100px"
          >Visit</button>
        </div>

        <div class="float-end" id="bookmarkControls" hidden>
          <button
            id="toggleToVisitsBtn"
            title="Toggle to visits"
            class="btn btn-outline-secondary"
            style="height: 38px; padding: 0"
          ><SvgReload/></button>
          <button
            id="openBookmarksBtn"
            title="Open bookmarks"
            class="btn btn-outline-secondary"
            style="height: 38px; padding: 0"
          ><SvgOpenInNewTab/></button>
          <button
            id="addBookmarkBtn"
            title="Add the bookmark to bookmarks"
            class="btn btn-outline-primary"
            style="min-width: 100px"
          >Bookmark</button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border: none;
}
</style>
