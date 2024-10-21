<script setup lang="ts">
import {exportVisits, importVisits}           from "@/bg/shared/visits";
import {exportScreenshots, deleteScreenshots} from "@/bg/shared/screenshots";


defineProps<{
  activePage: "visits" | "screens"
}>();

async function importVisitsListener(event: Event) {
  const inputElement = event.currentTarget as HTMLInputElement;
  const file: File = inputElement.files![0];
  console.log(file);
  const array = JSON.parse(await file.text());
  await importVisits(array);
}

async function deleteImages(event: MouseEvent) {
  const button = event.currentTarget as HTMLButtonElement;
  button.setAttribute("disabled", "");
  await deleteScreenshots();
  button.removeAttribute("disabled");
}

async function exportImages() {
  await exportScreenshots();
}
</script>

<template>
  <div data-comp="Controls" id="controls">
    <div v-if="activePage === 'visits'" class="d-flex flex-row-reverse ">
      <label class="btn btn-outline-primary m-2">
        <input type="file" accept="application/json" style="display: none"
               @change="importVisitsListener"
        >Import visits
      </label>
      <button class="btn btn-outline-primary m-2" id="export-visits"
              @click="exportVisits"
      >Export visits
      </button>
    </div>
    <div v-if="activePage === 'screens'" class="d-flex flex-row-reverse ">
      <button class="btn btn-outline-danger m-2" id="delete-images"
              @click="deleteImages"
      >Delete images</button>
      <button class="btn btn-outline-primary m-2" id="export-images"
              @click="exportImages"
      >Export images</button>
    </div>
    <hr>
  </div>
</template>

<style scoped>
.btn {
  width: 130px;
}
</style>
