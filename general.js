const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
const axios = require('axios');

let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(400).json({message: 'Please provide a valid username and password'});
  }

  // Check if username already exists
  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.status(409).json({message: 'Username already exists'});
  }

  // Add the new user to the users array
  users.push({username, password});

  // Return a success message
  return res.status(200).json({message: 'User registered successfully'});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  const booksList = JSON.stringify(books, null, 2);
  return res.status(200).send(`List of books available: \n${booksList}`);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {

  let isbn = req.params.isbn;
  let booksList=Object.values(books)
  let book = booksList.find(b => b.isbn===isbn);
  if (book) {
    let bookDetails = JSON.stringify(book);
    res.send(`Book details for ISBN ${isbn}: ${bookDetails}`);
  } else {
    res.send(`No book found for ISBN ${isbn}`);}
 });
  


// Get book details based on author
public_users.get('/author/:author',function (req, res) {
 let author = req.params.author;
 let booksList=Object.values(books)
 let book = booksList.find(b => b.author===author);

   if (book) {
    let bookDetails = JSON.stringify(book);
    res.send(`Book details for author ${author}: ${bookDetails}`);
  } else {
    res.send(`No book found for author ${author}`);}
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let title = req.params.title;
  let booksList=Object.values(books)
 let book = booksList.find(b => b.title===title);
  if (book) {
    let bookDetails = JSON.stringify(book);
    res.send(`Book details for title ${title}: ${bookDetails}`);
  } else {
    res.send(`No book found for title ${title}`);}
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  let booksList=Object.values(books)
  let book = booksList.find(b => b.isbn===isbn);
    if (book) {
    const reviews = book.reviews;
    res.send(reviews);
  } else {
    res.send("Book not found");}
});

module.exports.general = public_users;
