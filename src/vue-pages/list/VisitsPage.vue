<script setup lang="ts">
import {ref}       from "vue";
import Controls    from "./Controls.vue";
import VisitItem   from "./VisitItem.vue";
import {iAmReady, waitMe} from "@/vue-pages/header/router";
import {getVisits} from "@/bg/shared/visits";
import {Visit}     from "@/types";


const hrHidden = ref(true);
const visits = ref<Visit[]>([]);

waitMe();
void getVisits().then(value => {
  visits.value = value.reverse();
  console.log("📃 Visits:", value);
  hrHidden.value = false;
  iAmReady();
});
</script>

<template>
  <div data-comp="VisitsPage" id="visits-page" class="container">
    <Controls :activePage="'visits'"/>
    <div class="visits">
      <VisitItem v-for="visit of visits" :visit/>
    </div>
    <hr :hidden="hrHidden">
  </div>
</template>

<style scoped>

</style>
