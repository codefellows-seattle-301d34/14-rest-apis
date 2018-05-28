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

  // COMDONE: What is the purpose of this method?
  // The purpose of this method is to provide an admin the ability to search for and add books into the database using the forms in app and a route throught he server to produce results from the google api given a title, author, or isbn.
  bookView.initSearchFormPage = function() {
    app.showOnly('.search-view');

    $('#search-form').on('submit', function(event) {
      // COMDONE: What default behavior is being prevented here?
      // the default is to prevent reload of the page, where, it would most likely return an error or return back to home page because we are using pages to make faux urls using a single page view.
      event.preventDefault();

      // COMDONE: What is the event.target, below? What will happen if the user does not provide the information needed for the title, author, or isbn properties?
      // The event target is the the submission of search forms from the search container view if you are an admin. If the user enters nothing it should pass an empty string, I can't really see anything stopping it, but if you pass an empty string to a query it shouldn't display anything.
      let book = {
        title: event.target.title.value || '',
        author: event.target.author.value || '',
        isbn: event.target.isbn.value || '',
      };

      module.Book.find(book, bookView.initSearchResultsPage);

      // COMDONE: Why are these values set to an empty string?
      // These are set to an empty string to
      event.target.title.value = '';
      event.target.author.value = '';
      event.target.isbn.value = '';
    });
  };

  // COMDONE: What is the purpose of this method?
  // the purpose of this method is to initialize an admin only search page on the route page('/books/search'.

  bookView.initSearchResultsPage = function() {
    app.showOnly('.search-results');
    $('#search-list').empty();

    // COMDONE: Explain how the .forEach() method is being used below.
    // On the book all array of objects that we filled with the search results. We iterate over the array add text to the anchor tag about the add the book and then on the click of the detail button that now says add to list it passes the information needed to create the one book.
    module.Book.all.forEach(book => $('#search-list').append(book.toHtml()));
    $('.detail-button a').text('Add to list').attr('href', '/');
    $('.detail-button').on('click', function(e) {
      // COMDONE: Explain the following line of code.
      //To be perfectly honest I am not entirely sure. It's a jquery selector that is looking through the dom selecting the parent three elements up the DOM tree of the book id that was clicked and then grabbing the bookid data category from that click so  <li class="book-items" data-bookid={{book_id}}>.
      module.Book.findOne($(this).parent().parent().parent().data('bookid'));
    });
  };

  module.bookView = bookView;
})(app);

