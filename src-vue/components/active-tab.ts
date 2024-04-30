import {Ref, ref} from "vue";

export const activeTab: Ref<chrome.tabs.Tab | null> = ref(null);
