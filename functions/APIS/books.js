const { db, admin } = require("../util/admin");

const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} = require("firebase/storage");

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
exports.addNewBook = async (req, res) => {
  try {
    // Check for image data (base64 string)
    if (req.body.Image) {
      const imageData = req.body.Image;

      if (imageData.startsWith("data:")) {
        // Validate base64 format
        try {
          // Extract image data and content type
          const base64Parts = imageData.split(";base64,");
          const contentType = base64Parts[0].split(":")[1]; // e.g., "image/jpeg"
          const base64String = base64Parts[1];

          // Convert base64 string to buffer
          const buffer = Buffer.from(base64String, "base64");

          // Upload the image to Firebase Storage
          const storage = getStorage();
          const fileName = `${Date.now()}_${Math.floor(
            Math.random() * 1000000
          )}.${contentType.split("/")[1]}`; // Generate filename with extension

          const storageRef = ref(storage, `books/${fileName}`);
          const uploadTask = uploadBytes(storageRef, buffer, {
            contentType: contentType, // Set content type explicitly
          });

          // Wait for upload and get download URL
          const uploadSnapshot = await uploadTask;
          const downloadURL = await getDownloadURL(uploadSnapshot.ref);

          // Create book object with download URL
          const newBook = {
            Description: req.body.Description,
            Price: req.body.Price,
            SkuCode: req.body.SkuCode,
            BookName: req.body.BookName,
            Author: req.body.Author,
            ImageUrl: downloadURL,
            Grade: req.body.Grade,
            Weight: req.body.Weight,
            ImageFileName: fileName,
            Language: req.body.Language,
            Subject: req.body.Subject,
          };

          // Add book to Firestore
          const docRef = await db.collection("Books").add(newBook);

          // Return response with book data
          const responseItem = {
            id: docRef.id,
            ...newBook,
          };
          res.status(201).json(responseItem);
        } catch (error) {
          console.error(error);
          res
            .status(500)
            .json({ error: "Image upload or base64 parsing failed" });
        }
      } else {
        res.status(400).json({ error: "Invalid base64 image format" });
      }
    } else {
      res.status(400).json({ error: "No image data provided" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
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
      Language: req.body.Language,
      Grade: req.body.Grade,
      Subject: req.body.Subject,
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

exports.deleteBookByID = async (req, res) => {
  try {
    const bookId = req.params.Id;

    // Get book document
    const bookRef = db.collection("Books").doc(bookId);
    const bookSnap = await bookRef.get();

    // Check if book exists
    if (!bookSnap.exists) {
      return res
        .status(404)
        .json({ error: `Book with ID ${bookId} not found.` });
    }

    // Get image URL from book data (assuming a field named 'ImageUrl')
    const imageFile = bookSnap.data().ImageFileName;

    // If image URL exists, delete the image from Storage
    if (imageFile) {
      const storage = getStorage();
      const imageRef = ref(storage, `books/${imageFile}`); // Extract object name from URL
      await deleteObject(imageRef); // Delete the image
    }

    // Delete the book document
    await bookRef.delete();

    res.json({ message: `Book with ID ${bookId} deleted successfully.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete book" });
  }
};
