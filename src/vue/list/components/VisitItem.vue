<script setup lang="ts">
import {createBackgroundTab} from "@/util-ext-bg";
import {Visit} from "@/types";
import {dateFormatter} from "./core";

const props = defineProps<{visit: Visit}>();

function onUrlClick(event: MouseEvent) {
  event.preventDefault();
  createBackgroundTab(props.visit.url);
}

function onTitleClick(event: MouseEvent) {
  console.log("onTitleClick");
  event.preventDefault();
  if (event.ctrlKey) {
    if (location.hash.slice(1) !== props.visit.url) {
      location.hash = props.visit.url;
    } else {
      location.hash = "null";
    }
  }
}
</script>

<template>
  <div data-comp="VisitItem" class="visit mb-3" :id="visit.url">
    <h4 class="title"
        @click="onTitleClick"
    >{{visit.title || ""}}</h4>
    <h5>
      <a rel="noreferrer noopener"
         :href="visit.url"
         :title="visit.title || ''"
         @click="onUrlClick"
      >{{visit.url}}</a>
    </h5>
    <div title="created">{{dateFormatter(visit.created)}}</div>
    <i title="last visited time" v-if="visit.lastVisited">{{dateFormatter(visit.lastVisited)}}</i>
  </div>
</template>

<style scoped>
.visit:target {
  font-weight: bold;
}
.visit {
  padding-left: 12px;
}
.visit:hover {
  padding-left: 11px;
  border-left: 1px #0d6efd solid;
}
a:visited {
  color: #0a53be;
}
a {
  text-decoration: none;
  overflow-wrap: break-word;
}
</style>
