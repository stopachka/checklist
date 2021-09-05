import firebase from "firebase/app";
import "firebase/database";
import "firebase/storage";
import "firebase/auth";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCGmJjDGJSb4TVhSv3f2o6uyYzMtqmQHFM",
  authDomain: "checklist-64e02.firebaseapp.com",
  databaseURL: "https://checklist-64e02-default-rtdb.firebaseio.com",
  projectId: "checklist-64e02",
  storageBucket: "checklist-64e02.appspot.com",
  messagingSenderId: "704480931774",
  appId: "1:704480931774:web:e109806169229ca66093ef",
  measurementId: "G-KJ0DNENGWS"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(FIREBASE_CONFIG);
  window.firebase = firebase;
}
