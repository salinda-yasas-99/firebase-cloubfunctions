const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

//configuring express
const express = require("express");
const app = express();

//get all the books
const {
  getAllBooks,
  addNewBook,
  updateBook,
  deleteBookByID,
} = require("./APIS/books");

const {
  registerUser,
  loginUser,
  registerAdmin,
  registerSuperAdmin,
  accessAuthorize,
  accessCheck,
} = require("./APIS/user");

//books
app.get("/books", getAllBooks);
//app.get("/books", getAllBooks);
app.post("/addbook", accessAuthorize, addNewBook);
app.put("/books/:id", accessAuthorize, updateBook);
app.delete("/books/:Id", accessAuthorize, deleteBookByID);

//user
app.post("/user/register", registerUser);
app.post("/admin/register", registerAdmin);
app.post("/superadmin/register", registerSuperAdmin);
app.post("/user/login", loginUser);
app.post("/user/check", accessCheck);

// app.get("/books", (req, res) => {
//   admin
//     .firestore()
//     .collection("Books")
//     //.orderBy('createdAt', 'desc')
//     .get()
//     .then((data) => {
//       let books = [];
//       debugger;
//       data.forEach((doc) => {
//         // let bookData = doc.data();
//         // bookData.id = doc.id;

//         books.push({
//           bookId: doc.id,
//           ...doc.data(),
//         });
//       });
//       return res.json(books);
//     })
//     .catch((err) => console.error(err));
// });

// // app.post('/book/:id',async(req,res) =>{
// //     try{
// //         const bookId = req.params.id;
// //     }
// // });

// // app.post("/book/:id", (req, res) => {
// //   try {
// //     const bookId = req.params.id;
// //     const updatedBook = {
// //       Description: req.body.Description,
// //       Price: req.body.Price,
// //       SkuCode: req.body.SkuCode,
// //       BookName: req.body.BookName,
// //       Author: req.body.Author,
// //       ImageUrl: req.body.ImageUrl,
// //       Grade: req.body.Grade,
// //       Weight: req.body.Weight,
// //     };

// //     admin
// //       .firestore()
// //       .collection("Books")
// //       .doc(bookId)
// //       .update({
// //         Description: updatedBook.Description,
// //         Price: updatedBook.Price,
// //         SkuCode: updatedBook.SkuCode,
// //         BookName: updatedBook.BookName,
// //         Author: updatedBook.Author,
// //         ImageUrl: updatedBook.ImageUrl,
// //         Grade: updatedBook.Grade,
// //         Weight: updatedBook.Weight,
// //       })
// //       .then((doc) => {
// //         return admin.firestore().collection("Books").doc(bookId).get();
// //       })
// //       .catch((err) => {
// //         res.status(500).json({ error: `${err}` });
// //       });
// //   } catch (err) {
// //     res.json(err);
// //   }
// // });

// app.put("/book/:id", (req, res) => {
//   try {
//     const bookId = req.params.id;

//     const updatedBook = {
//       Description: req.body.Description,
//       Price: req.body.Price,
//       SkuCode: req.body.SkuCode,
//       BookName: req.body.BookName,
//       Author: req.body.Author,
//       ImageUrl: req.body.ImageUrl,
//       Grade: req.body.Grade,
//       Weight: req.body.Weight,
//     };

//     admin
//       .firestore()
//       .collection("Books")
//       .doc(bookId)
//       .set(req.body, { merge: true })
//       .then((doc) => {
//         res.json({ message: `book with id ${doc.id} updated` });
//       })
//       .catch((err) => {
//         res.status(500).json({ error: `${err}` });
//       });
//   } catch (err) {
//     res.json(err);
//   }
// });

// app.delete("/book/:id", (req, res) => {
//   const bookId = req.params.id;
//   admin.firestore
//     .collection("Books")
//     .doc(bookId)
//     .delete()
//     .then(() => {
//       res.json({ message: `Book with ID ${bookId} deleted successfully` });
//     })
//     .catch((err) => {
//       res.status(500).json({ error: `${err}` });
//     });
// });

exports.api = onRequest(app);
