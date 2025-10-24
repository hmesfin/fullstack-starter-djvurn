// frontend/src/main.ts
import { createApp } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import './style.css';
import App from './App.vue';

const app = createApp(App);

// Configure Vue Query
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
      },
    },
  },
});

app.mount('#app');
