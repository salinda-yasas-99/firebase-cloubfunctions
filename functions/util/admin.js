const admin = require("firebase-admin");

const firebaseConfig = require("./config");

//const { initializeApp } = require("firebase/app");

const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

// initializeApp({
//   serviceAccountId:
//     "firebase-adminsdk-puy7p@testing-demo-cfd2e.iam.gserviceaccount.com",
// });

initializeApp();

//const userApp = initializeApp(firebaseConfig);

//const firebase = require("firebase");

//const app = firebase.initializeApp(firebaseConfig);

//const fireapp = admin.initializeApp(firebaseConfig);

//admin.initializeApp(firebaseConfig);
//admin.initializeApp();

const db = admin.firestore();

module.exports = { admin, db, getAuth };
