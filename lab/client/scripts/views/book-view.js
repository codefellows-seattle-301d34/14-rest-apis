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
//This method initiates the search form page. When the user clicks the submit button, it will collect the information that the user has entered into the form; either the value of it or an empty string if nothing was typed it.  Then that informatoin is sent along to the Book.find method.
  bookView.initSearchFormPage = function() {
    app.showOnly('.search-view');

    $('#search-form').on('submit', function(event) {
      // COMMENT: What default behavior is being prevented here?
      //This is preventing the page from refreshing.
      event.preventDefault();

      // COMMENT: What is the event.target, below? What will happen if the user does not provide the information needed for the title, author, or isbn properties?
      //The event.target is the information typed into the form for that specific property and the value (text/string/number) is retrieved from it OR it is an empty string if left blank. 
      //I'm curious as to why event.target.SOMETHING.value was used instead of using jQuery's .val().  Wasn't .val() specificly to pull information from a form? My only guess is because the value of .val() is undefined if the field is left empty. Sorry, this is off topic.
      let book = {
        title: event.target.title.value || '',
        author: event.target.author.value || '',
        isbn: event.target.isbn.value || '',
      };

      module.Book.find(book, bookView.initSearchResultsPage);

      // COMMENT: Why are these values set to an empty string?
      //This is to clear out the form again after the information was submitted to Book.find.
      event.target.title.value = '';
      event.target.author.value = '';
      event.target.isbn.value = '';
    })
  }

  // COMMENT: What is the purpose of this method?
  //This method begins the search results page for the information submitted in the method above.  This will display the results.
  bookView.initSearchResultsPage = function() {
    app.showOnly('.search-results');
    $('#search-list').empty();

    // COMMENT: Explain how the .forEach() method is being used below.
    //For each book returned from the search, it will append the books to the page to the element with an id of search-list.
    module.Book.all.forEach(book => $('#search-list').append(book.toHtml()));
    $('.detail-button a').text('Add to list').attr('href', '/');
    $('.detail-button').on('click', function(e) {
      // COMMENT: Explain the following line of code.
      //This invokes the findOne method on Book and says for "this" result that I'm currently on, give me the parent element for the title, author, isbn, and the bookid for that particular result.  This will then be handed off to the Book.loadAll method seen on the  findOne method.
      module.Book.findOne($(this).parent().parent().parent().data('bookid'))
    });
  }

  module.bookView = bookView;
})(app)

