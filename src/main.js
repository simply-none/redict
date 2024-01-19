import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import { useErrorStore } from "./stores/error";

const app = createApp(App);

app.use(router);

app.use(ElementPlus);

app.use(createPinia());

app.mount("#app");

// store必须写在pinia的最下面
let { addError } = useErrorStore();

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.table([{ err, instance, info }]);
  addError(err);
};

app.config.globalProperties.$globalErrorHandler = (err, instance, info) => {
  addError(err);
  console.table([{ err, instance, info }]);
};
