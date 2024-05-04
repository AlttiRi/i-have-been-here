<script setup lang="ts">
import {ref, watchEffect} from "vue";
import {getTrimmedTitle} from "@/util-ext-pages";
import {core} from "./core";


watchEffect(() => {
  if (core.value) {
    void updateBottomHtml(core.value);
  }
});

const faviconSrc   = ref("#");
const faviconTitle = ref("");
const titleText    = ref("");
const titleTitle   = ref("");
const urlText      = ref("");
const urlTitle     = ref("");

async function updateBottomHtml(tab: chrome.tabs.Tab): Promise<void> {
  const {
    url = "", title = "", favIconUrl = "",
  } = tab;

  faviconTitle.value = favIconUrl;
  if (!favIconUrl) {
    faviconSrc.value = "/images/empty.png";
  } else
  if (favIconUrl.startsWith("data:")) {
    faviconSrc.value = favIconUrl;
    faviconTitle.value = favIconUrl.slice(0, 60) + (favIconUrl.length > 60 ? "…" : "");
  } else {
    faviconSrc.value = "chrome://favicon/size/16@2x/" + url;
  }

  const trimmedTitle = await getTrimmedTitle(title, url);
  titleText.value  = trimmedTitle.length > 3 ? trimmedTitle : title;
  titleTitle.value = titleText.value;
  const u = new URL(url);
  if (u.protocol.startsWith("http")) {
    urlText.value = u.host.replace(/^www./, "");
  } else {
    urlText.value = u.href;
  }
  urlTitle.value = url;
}

</script>

<template>
  <div data-comp="BottomInfo" class="card bottom-part">
    <div class="card-body" style="padding: 0; margin: 0;">
      <div class="info p-3">
        <div id="titleElem" :title="titleTitle">{{titleText || "&nbsp;"}}</div>
        <div class="bar">
          <div class="favicon-wrap">
            <img id="faviconElem" :src="faviconSrc" :title="faviconTitle" alt=""/>
          </div>
          <div id="urlElem" class="text-secondary" :title="urlTitle">{{urlText || "&nbsp;"}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
img#faviconElem {
  height: 22px;
  width: 22px
}
img#faviconElem[src="#"] {
  display: none;
}
.favicon-wrap {
  display: flex;
  margin: 0;
}
.info {
  max-width: 320px;
}
#titleElem {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.bar {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  padding-top:  0.5rem;
}
#urlElem {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  padding-left:  0.5rem;
}
</style>
