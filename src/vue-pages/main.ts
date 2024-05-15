import {createApp} from "vue";
import {router} from "@/vue-pages/header/router";
import App      from "@/vue-pages/App.vue";


createApp(App)
    .use(router)
    .mount("#app");
