<script setup lang="ts">
import VisitItem from "@/vue/list/components/VisitItem.vue";
import {onMounted, ref} from "vue";
import {Visit} from "@/types";
import {getVisits} from "@/bg/visits";
import {sleep} from "@/util";

const visits = ref<Visit[]>([]);
getVisits().then(value => {
  visits.value = value;
  console.log("Visits:", value);
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
  <div data-comp="VisitsPage" id="visits">
    <VisitItem v-for="visit of visits" :visit/>
  </div>
</template>

<style scoped>

</style>
