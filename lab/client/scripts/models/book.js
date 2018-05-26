'use strict';

var app = app || {};

const ENV = {};

ENV.isProduction = window.location.protocol === 'https:';
ENV.productionApiUrl = 'https://ta-booklist.herokuapp.com:3000';
ENV.developmentApiUrl = 'http://localhost:3000';
ENV.apiUrl = ENV.isProduction ? ENV.productionApiUrl : ENV.developmentApiUrl;
app.ENV = ENV;

(function(module) {
  function errorCallback(err) {
    console.error(err);
    module.errorView.initErrorPage(err);
  }

  function Book(rawBookObj) {
    Object.keys(rawBookObj).forEach(key => this[key] = rawBookObj[key]);
  }

  Book.prototype.toHtml = function() {
    let template = Handlebars.compile($('#book-list-template').text());
    return template(this);
  }

  Book.all = [];
  // I replaced the sort callback because it doesn't work on strings (a.title - b.title that is). This does, with the added benefit of ignoring leading "the" and also ignoring case.  No charge. ;)
  Book.loadAll = rows => Book.all = rows.sort((a, b) => {
    let titleA = a.title.toUpperCase().replace(/^THE[ ]*(.*)/,'$1');
    let titleB = b.title.toUpperCase().replace(/^THE[ ]*(.*)/,'$1');
    if (titleA < titleB) { return -1; }
    if (titleA > titleB) { return 1; }
    return 0;
  }).map(book => new Book(book));
  Book.fetchAll = callback =>
    $.get(`${ENV.apiUrl}/api/v1/books`)
      .then(Book.loadAll)
      .then(callback)
      .catch(errorCallback);

  Book.fetchOne = (ctx, callback) =>
    $.get(`${ENV.apiUrl}/api/v1/books/${ctx.params.book_id}`)
      .then(results => ctx.book = results[0])
      .then(callback)
      .catch(errorCallback);

  Book.create = book =>
    $.post(`${ENV.apiUrl}/api/v1/books`, book)
      .then(() => page('/'))
      .catch(errorCallback);

  Book.update = (book, bookId) =>
      $.ajax({
        url: `${ENV.apiUrl}/api/v1/books/${bookId}`,
        method: 'PUT',
        data: book,
      })
      .then(() => page(`/books/${bookId}`))
      .catch(errorCallback)

  Book.destroy = id =>
    $.ajax({
      url: `${ENV.apiUrl}/api/v1/books/${id}`,
      method: 'DELETE',
    })
    .then(() => page('/'))
    .catch(errorCallback)

  // COMMENT: Where is this method invoked? What is passed in as the 'book' argument when invoked? What callback will be invoked after Book.loadAll is invoked?
  // ANSWER: it's called from bookView.initSearchFormPage. The book object holds the three search fields available to the user (title, author or isbn). It's passed bookView.initSearchResultsPage as the callback which shows the search results after they come back from the server.
  Book.find = (book, callback) =>
    $.get(`${ENV.apiUrl}/api/v1/books/find`, book)
      .then(Book.loadAll)
      .then(callback)
      .catch(errorCallback)

  // COMMENT: Where is this method invoked? How does it differ from the Book.find method, above?
  // ANSWER: It's call from bookView.initSearchResultsPage within the forEach call back function.
  Book.findOne = isbn =>
    $.get(`${ENV.apiUrl}/api/v1/books/find/${isbn}`)
    .then(Book.create)
    .catch(errorCallback)

  module.Book = Book;
})(app)
