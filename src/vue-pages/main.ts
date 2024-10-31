import {createApp} from "vue";
import {router} from "@/vue-pages/header/router";
import App      from "@/vue-pages/App.vue";

console.log("createApp");
createApp(App)
    .use(router)
    .mount("#app");
console.log("createApp End");
