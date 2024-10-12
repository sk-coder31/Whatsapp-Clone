
import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"


const firebaseConfig = {
    apiKey: "AIzaSyAD9txGENNomT7T1NksH642hRyqPy36KHE",
    authDomain: "whattsapp-f5924.firebaseapp.com",
    projectId: "whattsapp-f5924",//whattsapp-f5924
    storageBucket: "whattsapp-f5924.appspot.com",
    messagingSenderId: "1089190951560",
    appId: "1:1089190951560:web:8937dcd5e32a98481e7d3d",
    measurementId: "G-63YG0Y38GH"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore();
const storage = getStorage();

export { auth, db, storage }

