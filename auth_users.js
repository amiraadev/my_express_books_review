const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  { id: 1, username: 'Amira', password: 'password1' },
  { id: 2, username: 'bob', password: 'password2' },
  { id: 3, username: 'charlie', password: 'password3' },
  { id: 4, username: 'david', password: 'password4' },
  { id: 5, username: 'emily', password: 'password5' },
  { id: 6, username: 'frank', password: 'password6' },
  { id: 7, username: 'grace', password: 'password7' },
  { id: 8, username: 'hank', password: 'password8' },
  { id: 9, username: 'isabelle', password: 'password9' },
  { id: 10, username: 'jason', password: 'password10' }
];

const isValid = (username, password)=>{ 
  return users.find(user => user.username === username && user.password === password);

}



const authenticatedUser = (username,password)=>{
   // check if the username exists in our records
   let usersList = Object.values(users);
   let user = usersList.find(b => b.username==username)
  if (user) {
    // check if the provided password matches the password in our records
    if (users.password === password) {
      // username and password match, return true
      return true;
    }
  }
  // username and/or password do not match, return false
  return false;
}
//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide a valid username and password' });
  }
  const user = users.find(u => u.username === username && u.password === password);

  // Check if username and password match
  if (username === user.username && password === user.password) {
    const accessToken = jwt.sign({ username, userPassword: password }, "secretKey", { expiresIn: '1h' });

    // Store the access token in the session
    req.session.accessToken = accessToken;

    return res.status(200).json({ message: 'Login successful',accessToken });
  } else {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
});
regd_users.get("/auth/review/", (req,res) => {
  if (!req.session.accessToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Access token exists, verify it
  try {
    const decodedToken = jwt.verify(req.session.accessToken, "secretKey");
    const { username } = decodedToken;
    return res.status(200).json({ message: `Hello ${username}, you are authenticated to access this route.` });
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

// Add a book review
regd_users.put('/auth/review/:isbn', function(req, res) {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.username;

  let booksList = Object.values(books)
  const book = booksList.find(b => b.isbn == isbn)
  // If the ISBN doesn't exist in the books object, send an error message
  if (!book) {
    res.status(404).send('The book with ISBN ' + isbn + ' does not exist.');
    return;
  }

  // If the user already posted a review for this book, modify the existing review
  if (book.reviews[username]) {
    book.reviews[username] = review;
    //res.json('Your review has been updated for the book with ISBN ' + isbn + ':'+ `${book}`);
    res.json(`Your review has been updated for the book ${book.title} by ${book.author} with ISBN ${isbn}: ==>${JSON.stringify(book)}`);

    return;
  }

  // If the user didn't post a review for this book, add a new review
  book.reviews[username] = review;
  //res.send('Your review has been posted for the book with ISBN ' + isbn + ':'+ `${book}`);
  res.json(`Your review has been posted for the book ${book.title} by ${book.author} with ISBN ${isbn}: ==>${JSON.stringify(book)}`);

});





regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.username;
  const isbn = req.params.isbn;
  
  let booksList = Object.values(books)
  const book = booksList.find(b => b.isbn == isbn)
  
  if (!book) {
    res.status(404).send(`The book with ISBN  ${isbn}  does not exist.`);
    return;
  }
  
  if (!book.reviews[username]) {
    res.status(404).send(`You have not posted any review for the book with ISBN  ${isbn}: ==>${JSON.stringify(book)}`);
    return;
  }
  
  delete book.reviews[username];
  res.send(`Your review has been deleted for the book with ${isbn} isbn: ==>${JSON.stringify(book)}`);
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
