'use strict';
var app = app || {};

(function(module) {
  $('.icon-menu').on('click', function(event) {
    $('.nav-menu').slideToggle(350);
  });

  const bookView = {};

  bookView.initIndexPage = function(ctx, next) {
    $('#book-list').empty();
    app.showOnly('.book-view');
    module.Book.all.forEach(book => $('#book-list').append(book.toHtml()));
    next();
  };

  bookView.initDetailPage = function(ctx, next) {
    $('.book-detail').empty();
    app.showOnly('.detail-view');

    $('.book-detail').append(app.render('book-detail-template', ctx.book));

    $('#update-btn').on('click', function() {
      page(`/books/${$(this).data('id')}/update`);
    });

    $('#delete-btn').on('click', function() {
      module.Book.destroy($(this).data('id'));
    });
    next();
  };

  bookView.initCreateFormPage = function() {
    app.showOnly('.create-view');

    $('#create-form').on('submit', function(event) {
      event.preventDefault();

      let book = {
        title: event.target.title.value,
        author: event.target.author.value,
        isbn: event.target.isbn.value,
        image_url: event.target.image_url.value,
        description: event.target.description.value,
      };

      module.Book.create(book);
    });
  };

  bookView.initUpdateFormPage = function(ctx) {
    app.showOnly('.update-view');

    $('#update-form input[name="title"]').val(ctx.book.title);
    $('#update-form input[name="author"]').val(ctx.book.author);
    $('#update-form input[name="isbn"]').val(ctx.book.isbn);
    $('#update-form input[name="image_url"]').val(ctx.book.image_url);
    $('#update-form textarea[name="description"]').val(ctx.book.description);

    $('#update-form').on('submit', function(event) {
      event.preventDefault();

      let book = {
        book_id: ctx.book.book_id,
        title: event.target.title.value,
        author: event.target.author.value,
        isbn: event.target.isbn.value,
        image_url: event.target.image_url.value,
        description: event.target.description.value,
      };

      module.Book.update(book, book.book_id);
    });
  };

  // COMMENT: What is the purpose of this method?
  //The purpose of this method is to listen for the submit event and look for the book the user is looking for, considering the given data (author, title and isbn).
  bookView.initSearchFormPage = function() {
    app.showOnly('.search-view');

    $('#search-form').on('submit', function(event) {
      // COMMENT: What default behavior is being prevented here?
      //It is preventinf form submit if any entree is missing. So if any box is ampty it won't submit.
      event.preventDefault();

      // COMMENT: What is the event.target, below? What will happen if the user does not provide the information needed for the title, author, or isbn properties?
      //This event target is whenever the user enters title,author and isbn, those properties will have that value. If the user doesn't enter any value then we wouldn't have any data tu run this part of the app.
      let book = {
        title: event.target.title.value || '',
        author: event.target.author.value || '',
        isbn: event.target.isbn.value || '',
      };

      module.Book.find(book, bookView.initSearchResultsPage);

      // COMMENT: Why are these values set to an empty string?
      //Because they will get their value when an input exists.
      event.target.title.value = '';
      event.target.author.value = '';
      event.target.isbn.value = '';
    });
  };

  // COMMENT: What is the purpose of this method?
  //The purpose of this method is to show the list of the books that were searched. Also this page has a feature in which you can add a book to the list.
  bookView.initSearchResultsPage = function() {
    app.showOnly('.search-results');
    $('#search-list').empty();

    // COMMENT: Explain how the .forEach() method is being used below.
    //This forEach method is saying that forEach book found in Book.all (array of books), it will be appended to the element in HTML that has an id of 'search-list'.
    module.Book.all.forEach(book => $('#search-list').append(book.toHtml()));
    $('.detail-button a').text('Add to list').attr('href', '/');
    $('.detail-button').on('click', function(e) {
      // COMMENT: Explain the following line of code.
      // With this line of code we can find a new book with its id.
      module.Book.findOne($(this).parent().parent().parent().data('bookid'));
    });
  };

  module.bookView = bookView;
})(app);

