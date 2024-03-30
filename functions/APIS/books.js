const { db } = require("../util/admin");

//get all the books
exports.getAllBooks = (req, res) => {
  db.collection("Books")
    //.orderBy('createdAt', 'desc')
    .get()
    .then((data) => {
      let books = [];
      debugger;
      data.forEach((doc) => {
        // let bookData = doc.data();
        // bookData.id = doc.id;

        books.push({
          bookId: doc.id,
          ...doc.data(),
        });
      });
      return res.json(books);
    })
    .catch((err) => console.error(err));
};

//add new book
exports.addNewBook = (req, res) => {
  const newBook = {
    Description: req.body.Description,
    Price: req.body.Price,
    SkuCode: req.body.SkuCode,
    BookName: req.body.BookName,
    Author: req.body.Author,
    ImageUrl: req.body.ImageUrl,
    Grade: req.body.Grade,
    Weight: req.body.Weight,
  };

  db.collection("Books")
    .add(newBook)
    .then((doc) => {
      const responseItem = newBook;
      responseItem.id = doc.id;
      return res.json(responseItem);
    })
    .catch((err) => {
      res.status(500).json({ error: `${err}` });
    });
};

//update book
exports.updateBook = (req, res) => {
  try {
    const bookId = req.params.id;

    const updatedBook = {
      Description: req.body.Description,
      Price: req.body.Price,
      SkuCode: req.body.SkuCode,
      BookName: req.body.BookName,
      Author: req.body.Author,
      ImageUrl: req.body.ImageUrl,
      Grade: req.body.Grade,
      Weight: req.body.Weight,
    };

    db.collection("Books")
      .doc(bookId)
      .update(updatedBook)
      .then((doc) => {
        const responseItem = updatedBook;
        responseItem.id = doc.id;
        return res.json(responseItem);
      })
      .catch((err) => {
        res.status(500).json({ error: `${err}` });
      });
  } catch (err) {
    res.status(500).json(err);
  }
};

//delete book
exports.deleteBookByID = (req, res) => {
  const bookId = req.params.Id;

  db.collection("Books")
    .doc(bookId)
    .delete()
    .then(() => {
      res.json({ message: `Book with ID ${bookId} deleted successfully.` });
    })
    .catch((error) => {
      res.status(500).json({ error: "Failed to delete book" });
      console.error(error);
    });
};
