//const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const { error } = require("firebase-functions/logger");
const { initializeApp } = require("firebase/app");
const { admin, db } = require("../util/admin");
const { firebaseConfig } = require("../util/config");
//const firebase = require("firebase/app");

const {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} = require("firebase/auth");

//const auth = require("firebase/auth");

const app = initializeApp(firebaseConfig);

const userAuth = getAuth(app);

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
        return createUserWithEmailAndPassword(
          userAuth,
          newUser.email,
          newUser.password
        );
        // createUser({
        //   email: newUser.email,
        //   password: newUser.password,
        // });
      }
    })
    .then((userRecord) => {
      //var uid = userRecord.user.uid;
      //return res.status(200).json(`uid = ${uid}`);
      //return res.status(200).json({ user: userRecord });
      return res
        .status(200)
        .json({ token: userRecord.user.stsTokenManager.accessToken });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err });
    });
};

exports.loginUser = (req, res) => {
  // const userAuth = getAuth();
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  // firebase
  //   .auth()

  signInWithEmailAndPassword(userAuth, user.email, user.password)
    //signInWithEmailAndPassword(userAuth, user.email, user.password)
    .then((obj) => {
      //return res.status(200).json("log in successfull");
      return res
        .status(200)
        .json({ Token: obj.user.stsTokenManager.accessToken });
    })
    .catch((error) => {
      if (error.code === "auth/user-not-found") {
        return res.status(401).json("There no user exist with that email");
        //console.log("There no user exist with that email");
      }

      if (error.code === "auth/invalid-email") {
        return res.status(401).json("That email address is invalid!");
        //.log("That email address is invalid!");
      }
      return res.status(401).json("something went wrong!");
    });
};
