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
exports.registerAdmin = async (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
  };

  // ToDO valiate data
  const doc = await db.collection("users").doc(newUser.email).get();
  if (doc.exists) {
    return res.status(400).json({ email: "email already exists" });
  }

  try {
    const userRecord = await createUserWithEmailAndPassword(
      userAuth,
      newUser.email,
      newUser.password
    );
    let user = {
      email: userRecord.user.email,
      userId: userRecord.user.uid,
      role: "admin",
    };

    await db.collection("users").add(user);
    //user record
    //return userRecord.user.getIdToken();
    //return res.status(200).json(userRecord);
    return res.status(200).json("new admin registered successfully");
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err });
  }
};

//superAdmin role register
exports.registerSuperAdmin = async (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
  };

  // ToDO valiate data
  const doc = await db.collection("users").doc(newUser.email).get();
  if (doc.exists) {
    return res.status(400).json({ email: "email already exists" });
  }

  try {
    const userRecord = await createUserWithEmailAndPassword(
      userAuth,
      newUser.email,
      newUser.password
    );
    let user = {
      email: userRecord.user.email,
      userId: userRecord.user.uid,
      role: "superadmin",
    };

    await db.collection("users").add(user);
    return res.status(200).json("new superadmin registered successfully");
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err });
  }
};

//dashboard login
exports.loginUser = async (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  try {
    const userRecord = await signInWithEmailAndPassword(
      userAuth,
      user.email,
      user.password
    );
    //const token = await userRecord.user.getIdToken();
    //return res.status(200).json({ idtoken: token });
    return res.status(200).json(userRecord);
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      return res.status(401).json("There no user exist with that email");
    }

    if (error.code === "auth/invalid-email") {
      return res.status(401).json("That email address is invalid!");
    }
    return res.status(401).json("something went wrong!");
  }
};

//admin and superadmin authorize
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

//superadmin authorize
exports.accessAuthorizeSuper = async (req, res, next) => {
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
      if (userData.role === "superadmin") {
        return next();
      } else {
        console.error({ error: "you are unauthorised to perform this action" });
        return res
          .status(403)
          .json(`you are unauthorised to perform this action`);
      }
    } else {
      console.error("User not found");
      return res.status(403).json({ error: "user not found" });
    }
  } catch (err) {
    console.error("Error while verifying token", err);
    return res.status(403).json({ error: "Error while verifying token" });
  }
};

//book store user save in database
exports.UserSave = async (req, res) => {
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
    const email = decodedToken.email;
    let user = {
      userId: uid,
      email: email,
      role: "users",
    };

    await db.collection("users").add(user);
    return res.status(200).json("User saved to database successfully");
  } catch (err) {
    console.error("Error while verifying token", err);
    return res.status(403).json({ error: "Error while verifying token" });
  }
};

//access check
// exports.accessCheck = async (req, res) => {
//   let jwtToken;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer ")
//   ) {
//     var idTok = req.headers.authorization.split("Bearer ")[1];
//     jwtToken = idTok;
//   } else {
//     console.error("No token found");
//     return res.status(403).json({ error: "Unauthorized" });
//   }

//   try {
//     const decodedToken = await admin.auth().verifyIdToken(jwtToken);
//     const uid = decodedToken.uid;
//     const userSnapshot = await db
//       .collection("users")
//       .where("userId", "==", uid)
//       .get();
//     if (!userSnapshot.empty) {
//       // Extract the user document data from the first document in the snapshot
//       const userData = userSnapshot.docs[0].data();
//       if (userData.role === "admin" || userData.role === "superadmin") {
//         return res.status(200).json(`${userData.role} = you are authorised`);
//       } else {
//         return res.status(403).json(`you are umauthorised`);
//       }
//       //return res.status(200).json(userData.role);
//       //return res.status(200).json({ userSnapshot });
//     } else {
//       console.error("User not found");
//       return res.status(403).json({ error: "user not found" });
//     }
//   } catch (err) {
//     console.error("Error while verifying token", err);
//     return res.status(403).json({ error: "Error while verifying token" });
//   }
// };
