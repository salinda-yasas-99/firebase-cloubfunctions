const admin = require("firebase-admin");

const firebaseConfig = require("./config");

//const firebase = require("firebase");

//const app = firebase.initializeApp(firebaseConfig);

//const fireapp = admin.initializeApp(firebaseConfig);

admin.initializeApp(firebaseConfig);

const db = admin.firestore();

module.exports = { admin, db };
