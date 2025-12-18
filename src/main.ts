import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Tres from '@tresjs/core';

import App from './App.vue';
import router from './router';
import './assets/main.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Tres);

app.mount('#app');
