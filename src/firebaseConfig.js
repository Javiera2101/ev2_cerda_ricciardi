import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBgupycPqMlg19km8bgHe213Lc_EduRP18",
  authDomain: "certamen2react.firebaseapp.com",
  projectId: "certamen2react",
  storageBucket: "certamen2react.firebasestorage.app",
  messagingSenderId: "1074670973826",
  appId: "1:1074670973826:web:f13fcc60f01b803ac3159b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);