// Importing Vue + its ecosystem
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
// Importing Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { getStorage } from 'firebase/storage';
// Importing plugins
import FontAwesome from "@/plugins/FontAwesome";
import VPagination from '@/plugins/VPagination';
import VeeValidatePlugin from '@/plugins/VeeValidatePlugin';

// Initializing Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDrneVPNzmr8y5EraatCBjTIM4UIf563xs",
  authDomain: "spa-blog-c7ad9.firebaseapp.com",
  projectId: "spa-blog-c7ad9",
  storageBucket: "spa-blog-c7ad9.appspot.com",
  messagingSenderId: "965165354166",
  appId: "1:965165354166:web:8683642d1540a64df6ea17"
}
const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);

// Creating Vue app
const app = createApp(App)
  .use(router)
  .use(createPinia())
  .use(FontAwesome)
  .use(VPagination)
  .use(VeeValidatePlugin)

// Базовые компоненты: делаем глобальными компоненты, начинающиеся на App...
const requireComponent = require.context("@/components/ui", true, /App[A-Z]\w+\.(vue|js)$/)
requireComponent.keys().forEach(function (fileName) {
  let baseComponentConfig = requireComponent(fileName)
  baseComponentConfig = baseComponentConfig.default || baseComponentConfig
  const baseComponentName = baseComponentConfig.name || (
    fileName
      .replace(/^.+\//, '')
      .replace(/\.\w+$/, '')
  )
  app.component(baseComponentName, baseComponentConfig)
});

app.mount('#app');
