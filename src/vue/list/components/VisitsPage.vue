<script setup lang="ts">
import VisitItem from "@/vue/list/components/VisitItem.vue";
import {onMounted, ref} from "vue";
import {Visit} from "@/types";
import {getVisits} from "@/bg/visits";
import {sleep} from "@/util";

const hrHidden = ref(true);
const visits = ref<Visit[]>([]);
getVisits().then(value => {
  visits.value = value;
  console.log("Visits:", value);
  hrHidden.value = false;
});

onMounted(async function scrollToHash() {
  const hash = location.hash;
  if (!hash) {
    return;
  }
  if (location.hash === "#null") {
    location.hash = "";
    return;
  }
  await sleep(0);
  location.hash = "";
  location.hash = hash;
});
</script>

<template>
  <div data-comp="VisitsPage" id="visits-page" class="container">
    <VisitItem v-for="visit of visits" :visit/>
    <hr :hidden="hrHidden">
  </div>
</template>

<style scoped>

</style>
