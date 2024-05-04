import {Ref, ref} from "vue";

export const core: Ref<chrome.tabs.Tab | null> = ref(null);
