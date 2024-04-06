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

//user role register
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
      let user = {
        email: userRecord.user.email,
        userId: userRecord.user.uid,
        role: "user",
      };

      db.collection("users").add(user);

      //var uid = userRecord.user.uid;
      //return res.status(200).json(`uid = ${uid}`);
      //return res.status(200).json({ user: userRecord });
      // return res
      //   .status(200)
      //   .json({ token: userRecord.user.stsTokenManager.accessToken });
      return userRecord.user.getIdToken();
    })
    .then((token) => {
      return res.status(200).json({ idtoken: token });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err });
    });
};

//admin role register
exports.registerAdmin = (req, res) => {
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
      let user = {
        email: userRecord.user.email,
        userId: userRecord.user.uid,
        role: "admin",
      };

      db.collection("users").add(user);
      return userRecord.user.getIdToken();
    })
    .then((token) => {
      return res.status(200).json({ idtoken: token });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err });
    });
};

//superAdmin role register
exports.registerSuperAdmin = (req, res) => {
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
      let user = {
        email: userRecord.user.email,
        userId: userRecord.user.uid,
        role: "superadmin",
      };

      db.collection("users").add(user);
      return userRecord.user.getIdToken();
    })
    .then((token) => {
      return res.status(200).json({ idtoken: token });
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

  signInWithEmailAndPassword(userAuth, user.email, user.password)
    //signInWithEmailAndPassword(userAuth, user.email, user.password)
    .then((userRecord) => {
      return userRecord.user.getIdToken();
      //return res.status(200)
      //.json({ Token: obj.user.stsTokenManager.accessToken });
      //.json({ obj })
      //.json({userRecord.user.get});
    })
    .then((token) => {
      return res.status(200).json({ idtoken: token });
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

exports.accessAuthorize = async (req, res, next) => {
  let jwtToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    var idTok = req.headers.authorization.split("Bearer ")[1];
    jwtToken = idTok;
  } else {
    console.error("No token found");
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(jwtToken);
    const uid = decodedToken.uid;
    const userSnapshot = await db
      .collection("users")
      .where("userId", "==", uid)
      .get();
    if (!userSnapshot.empty) {
      // Extract the user document data from the first document in the snapshot
      const userData = userSnapshot.docs[0].data();
      if (userData.role === "admin" || userData.role === "superadmin") {
        return next();
      } else {
        console.error({ error: "you are umauthorised to perform this action" });
        return res
          .status(403)
          .json(`you are umauthorised to perform this action`);
      }
      //return res.status(200).json(userData.role);
      //return res.status(200).json({ userSnapshot });
    } else {
      console.error("User not found");
      return res.status(403).json({ error: "user not found" });
    }
  } catch (err) {
    console.error("Error while verifying token", err);
    return res.status(403).json({ error: "Error while verifying token" });
  }
};

/*exports.accessAuthorize = (req, res, next) => {
  let jwtToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
    jwtToken = idToken;
  } else {
    console.error("No token found");
    return res.status(403).json({ error: "Unauthorized" });
  }

  // getAuth()
  //   .verifyIdToken(jwtToken)
  admin
    .auth()
    .verifyIdToken(jwtToken)
    .then((decodedToken) => {
      const uid = decodedToken.uid;
      let user = db.collection("users").doc(uid).get();
      if (user) {
        return next();
      }
    })
    .catch((err) => {
      console.error("Error while verifying token", err);
      return res.status(403).json(err);
    });
};*/

exports.accessCheck = async (req, res) => {
  let jwtToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    var idTok = req.headers.authorization.split("Bearer ")[1];
    jwtToken = idTok;
  } else {
    console.error("No token found");
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(jwtToken);
    const uid = decodedToken.uid;
    const userSnapshot = await db
      .collection("users")
      .where("userId", "==", uid)
      .get();
    if (!userSnapshot.empty) {
      // Extract the user document data from the first document in the snapshot
      const userData = userSnapshot.docs[0].data();
      if (userData.role === "admin" || userData.role === "superadmin") {
        return res.status(200).json(`${userData.role} = you are authorised`);
      } else {
        return res.status(403).json(`you are umauthorised`);
      }
      //return res.status(200).json(userData.role);
      //return res.status(200).json({ userSnapshot });
    } else {
      console.error("User not found");
      return res.status(403).json({ error: "user not found" });
    }
  } catch (err) {
    console.error("Error while verifying token", err);
    return res.status(403).json({ error: "Error while verifying token" });
  }
};

// admin
//     .auth()
//     .verifyIdToken(jwtToken)
//     .then((decodedToken) => {
//       const uid = decodedToken.uid;
//       let user = db.collection("users").doc(uid).get();
//       return res.status(200).json(user);
//       // if (user.role == "admin") {
//       //   return res.status(200).json("this is admin");
//       // } else if (user.role == "user") {
//       //   return res.status(200).json("this is user");
//       // } else if (user.role == "superAdmin") {
//       //   return res.status(200).json("this is superAdmin");
//       // } else {
//       //   return res.status(200).json("No role found");
//       // }
//     })
//     .catch((err) => {
//       console.error("Error while verifying token", err);
//       return res.status(403).json(err);
//     });
