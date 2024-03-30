const { error } = require("firebase-functions/logger");
//const firebaseConfig = require("../util/config");
//const firebase = require("firebase");
const { admin, db } = require("../util/admin");

//firebase.initializeApp(firebaseConfig);

exports.registerUser = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    // confirmPassword: req.body.confirmPassword,
  };
  // ToDO valiate data
  db.collection("users")
    .doc(newUser.email)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ email: "email already exists" });
      } else {
        return admin
          .auth()
          .createUser({ email: newUser.email, password: newUser.password });
      }
    })
    .then(async (userRecord) => {
      //const customToken = await admin.auth().createCustomToken(userRecord.uid);
      // customToken;
      //   const userCredential = await admin
      //     .auth()
      //     .signInWithEmailAndPassword(newUser.email, newUser.password);
      // Get the access token
      const token = await userCredential.user.getIdToken();
      return token;
      //   const tok = await getIdToken(data);
      //   return tok;
    })
    .then((token) => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
