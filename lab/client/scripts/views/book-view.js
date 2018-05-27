'use strict';
var app = app || {};

(function(module) {
  $('.icon-menu').on('click', function(event) {
    $('.nav-menu').slideToggle(350);
  })

  const bookView = {};

  bookView.initIndexPage = function(ctx, next) {
    $('#book-list').empty();
    app.showOnly('.book-view');
    module.Book.all.forEach(book => $('#book-list').append(book.toHtml()));
    next();
  }

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
  }

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
    })
  }

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
    })
  };

// COMMENT: What is the purpose of this method?
// renders the search form when the search nav is clicked.
  bookView.initSearchFormPage = function() {
    app.showOnly('.search-view');

    $('#search-form').on('submit', function(event) {
      // COMMENT: What default behavior is being prevented here?
      //submit refreshes the page and prevents that
      event.preventDefault();

      // COMMENT: What is the event.target, below? What will happen if the user does not provide the information needed for the title, author, or isbn properties?
      // Grabs the value that the user inputted in the input, event.target is the one that the inputted into and if the other inputs were empty, it becomes a empty string.
      let book = {
        title: event.target.title.value || '',
        author: event.target.author.value || '',
        isbn: event.target.isbn.value || '',
      };

      module.Book.find(book, bookView.initSearchResultsPage);

      // COMMENT: Why are these values set to an empty string?
      // So that the form 'refreshes' and all the inputable form is empty again.
      event.target.title.value = '';
      event.target.author.value = '';
      event.target.isbn.value = '';
    })
  }

  // COMMENT: What is the purpose of this method?
  // renders the results of the search on the page. 
  bookView.initSearchResultsPage = function() {
    app.showOnly('.search-results');
    $('#search-list').empty();

    // COMMENT: Explain how the .forEach() method is being used below.
    // taking each book and passing it through the handlebar and appending it on page. 
    module.Book.all.forEach(book => $('#search-list').append(book.toHtml()));
    $('.detail-button a').text('Add to list').attr('href', '/');
    $('.detail-button').on('click', function(e) {
      // COMMENT: Explain the following line of code.
      // the great-grandparent of detail-button can be found in the handlebar in the html. it is the data-bookid attritbute with the book_id as its data. This book_id becomes the parameter for findOne which is in book.js. It goes and gets the book with the same thing you pass it, in this case the id, then posts that book into the DB and sends you back to the main page.
      module.Book.findOne($(this).parent().parent().parent().data('bookid'))
    });
  }

  module.bookView = bookView;
})(app)

