import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDdlOgQEoRS3V8Gqbs8noWyC7FpuI69PgA",
  authDomain: "hancock-family-garden.firebaseapp.com",
  projectId: "hancock-family-garden",
  storageBucket: "hancock-family-garden.firebasestorage.app",
  messagingSenderId: "770551464706",
  appId: "1:770551464706:web:256a124a716557631eb81b",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
