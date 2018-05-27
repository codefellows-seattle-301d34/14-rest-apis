'use strict'

// Application dependencies
const express = require('express');
const cors = require('cors');
const pg = require('pg');
const superagent = require('superagent');

// Application Setup
const app = express();
const PORT = process.env.PORT;
const TOKEN = process.env.TOKEN;

// COMMENT: Explain the following line of code. What is the API_KEY? Where did it come from?
//The API_Key is an authorization token given to you to be able to use a particular API in a certain way. Sometimes this means you get to make more calls to the API than you would without a key and sometimes it means that you get more access or more featues/information from the API.  You follow the API's documentation to ask for the key. Your information will be linked to it in someway so they can track who is making calls to their service. KEEP IT SECRET!
const API_KEY = process.env.GOOGLE_API_KEY;

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Application Middleware
app.use(cors());

// API Endpoints
app.get('/api/v1/admin', (req, res) => res.send(TOKEN === parseInt(req.query.token)))

app.get('/api/v1/books/find', (req, res) => {
  let url = 'https://www.googleapis.com/books/v1/volumes';

  // COMMENT: Explain the following four lines of code. How is the query built out? What information will be used to create the query?
  //The query is being built out with the title, author, and isbn dynamically.
  let query = ''
  //This is setting a variable named query, that is currently empty, to hold whatever string you need to put into it
  if(req.query.title) query += `+intitle:${req.query.title}`;
  //If req.query.title is a thing, then add to that empty string the items in the template literal.
  if(req.query.author) query += `+inauthor:${req.query.author}`;
  //If req.query.author is a thing, then add to that empty string the items in the template literal.
  if(req.query.isbn) query += `+isbn:${req.query.isbn}`;
  //If req.query.isbn is a thing, then add to that empty string the items in the template literal.

  //TODO:
  // COMMENT: What is superagent? How is it being used here? What other libraries are available that could be used for the same purpose?
  //Superagent is a ajax API (that's from the docs) but as I understand it, it makes getting data from APIs much easier to do.
  superagent.get(url)
    .query({'q': query})
    .query({'key': API_KEY})
    .then(response => response.body.items.map((book, idx) => {

      // COMMENT: The line below is an example of destructuring. Explain destructuring in your own words.
      //Destructuring used here is a way of getting the properties in an object to be individual variables instead of listing them out one at a time (i.e. book.volumeInfo. title, book.volumeInfo.authors, etc.)
      let { title, authors, industryIdentifiers, imageLinks, description } = book.volumeInfo;

      // COMMENT: What is the purpose of the following placeholder image?
      //When I opened it, it says "No Cover Available", so I'm assuming that if a book does not have a cover image or one that cannot be displayed, then this image would that that place.
      let placeholderImage = 'http://www.newyorkpaddy.com/images/covers/NoCoverAvailable.jpg';

      // COMMENT: Explain how ternary operators are being used below.
      //Ternary is being used to determine the value of the property/what should be displayed. For the title, does the title exisit? If yes, show the title. If not, show the string.  This is also where the placeholder image comes into play that was listed above. If the image_url has a link to a smallThumbnail, use it. Otherwise, use the placeholder.
      return {
        title: title ? title : 'No title available',
        author: authors ? authors[0] : 'No authors available',
        isbn: industryIdentifiers ? `ISBN_13 ${industryIdentifiers[0].identifier}` : 'No ISBN available',
        image_url: imageLinks ? imageLinks.smallThumbnail : placeholderImage,
        description: description ? description : 'No description available',
        book_id: industryIdentifiers ? `${industryIdentifiers[0].identifier}` : '',
      }
    }))
    .then(arr => res.send(arr))
    .catch(console.error)
})

// COMMENT: How does this route differ from the route above? What does ':isbn' refer to in the code below?
//This differs from the route above by listening specifically for a route that includes an isbn number. This will point to a specific book instead of many books. ':isbn' is the reference for an idividual book since isbn is a unique number to that work.
app.get('/api/v1/books/find/:isbn', (req, res) => {
  let url = 'https://www.googleapis.com/books/v1/volumes';
  superagent.get(url)
    .query({ 'q': `+isbn:${req.params.isbn}`})
    .query({ 'key': API_KEY })
    .then(response => response.body.items.map((book, idx) => {
      let { title, authors, industryIdentifiers, imageLinks, description } = book.volumeInfo;
      let placeholderImage = 'http://www.newyorkpaddy.com/images/covers/NoCoverAvailable.jpg';

      return {
        title: title ? title : 'No title available',
        author: authors ? authors[0] : 'No authors available',
        isbn: industryIdentifiers ? `ISBN_13 ${industryIdentifiers[0].identifier}` : 'No ISBN available',
        image_url: imageLinks ? imageLinks.smallThumbnail : placeholderImage,
        description: description ? description : 'No description available',
      }
    }))
    .then(book => res.send(book[0]))
    .catch(console.error)
})

app.get('/api/v1/books', (req, res) => {
  let SQL = 'SELECT book_id, title, author, image_url, isbn FROM books;';
  client.query(SQL)
    .then(results => res.send(results.rows))
    .catch(console.error);
});

app.get('/api/v1/books/:id', (req, res) => {
  let SQL = 'SELECT * FROM books WHERE book_id=$1';
  let values = [req.params.id];
  
  client.query(SQL, values)
    .then(results => res.send(results.rows))
    .catch(console.error);
});

app.post('/api/v1/books', express.urlencoded(), (req, res) => {
  let {title, author, isbn, image_url, description} = req.body;
  
  let SQL = 'INSERT INTO books(title, author, isbn, image_url, description) VALUES($1, $2, $3, $4, $5);';
  let values = [title, author, isbn, image_url, description];
  
  client.query(SQL, values)
    .then(() => res.sendStatus(201))
    .catch(console.error);
});

app.put('/api/v1/books/:id', express.urlencoded(), (req, res) => {
  let {title, author, isbn, image_url, description} = req.body;
  
  let SQL = 'UPDATE books SET title=$1, author=$2, isbn=$3, image_url=$4, description=$5 WHERE book_id=$6;';
  let values = [title, author, isbn, image_url, description, req.params.id];
  
  client.query(SQL, values)
    .then(() => res.sendStatus(204))
    .catch(console.error)
})

app.delete('/api/v1/books/:id', (req, res) => {
  let SQL = 'DELETE FROM books WHERE book_id=$1;';
  let values = [req.params.id];
  
  client.query(SQL, values)
    .then(() => res.sendStatus(204))
    .catch(console.error);
});

app.get('*', (req, res) => res.status(403).send('This route does not exist'));

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
