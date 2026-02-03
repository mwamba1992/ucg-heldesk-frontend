import { createApp } from 'vue';
import { createPinia } from 'pinia';

import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';

import App from './App.vue';
import router from './router';
import './assets/main.css';

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#00a0d1',
          'primary-darken-1': '#0088b3',
          secondary: '#64748b',
          accent: '#00b8e6',
          error: '#ef4444',
          info: '#0ea5e9',
          success: '#10b981',
          warning: '#f59e0b',
          background: '#f8fafc',
          surface: '#ffffff',
        },
      },
      dark: {
        colors: {
          primary: '#22c5ed',
          'primary-darken-1': '#00a0d1',
          secondary: '#94a3b8',
          accent: '#38bdf8',
          error: '#f87171',
          info: '#38bdf8',
          success: '#34d399',
          warning: '#fbbf24',
          background: '#0f172a',
          surface: '#1e293b',
        },
      },
    },
  },
  defaults: {
    VBtn: {
      variant: 'flat',
      rounded: 'lg',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VCard: {
      rounded: 'xl',
      elevation: 0,
    },
    VChip: {
      rounded: 'lg',
    },
  },
});

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);

app.mount('#app');
