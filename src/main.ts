import { createApp } from "vue";
import "./style.css";

import App from "./App.vue";

import { createPinia } from "pinia";
import { vuetify } from "./plugins/vuetify";
import { router } from "./router";

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);

app.use(router);
app.use(vuetify);

app.mount("#app");
