<script setup lang="ts">
import {dateFormatter}       from "@/util";
import {createBackgroundTab} from "@/util-ext-bg";
import {getHash, setHash}    from "@/vue-pages/header/router";
import {Visit}               from "@/types";


const props = defineProps<{visit: Visit}>();

function onUrlClick(event: MouseEvent) {
  event.preventDefault();
  createBackgroundTab(props.visit.url);
}

function onTitleClick(event: MouseEvent) {
  console.log("onTitleClick");
  event.preventDefault();
  if (event.ctrlKey) {
    if (getHash() !== props.visit.url) {
      void setHash(props.visit.url);
    } else {
      void setHash("");
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
      <a :href="visit.url"
         :title="visit.title || ''"
         @click="onUrlClick"
         rel="noreferrer noopener" target="_blank"
      >{{visit.url}}</a>
    </h5>
    <div title="created">{{dateFormatter(visit.created)}}</div>
    <i title="last visited time" v-if="visit.lastVisited">{{dateFormatter(visit.lastVisited)}}</i>
  </div>
</template>

<style scoped>
.visit:target,
.visit.hash-target
{
  font-weight: bold;
}
.visit {
  padding-left: 12px;
  scroll-margin: 80px;
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
