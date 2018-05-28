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
//  This shows only the search form until the user clicks submit, and then it searches the database for the information the user gave. 
  bookView.initSearchFormPage = function() {
    app.showOnly('.search-view');

    $('#search-form').on('submit', function(event) {
      // COMMENT: What default behavior is being prevented here?
      //stops the page from refreshing on 'submit'
      event.preventDefault();

      // COMMENT: What is the event.target, below? What will happen if the user does not provide the information needed for the title, author, or isbn properties?
      //takes the value that the user entered in input. //event.target is what was inputted into and if the any inputs are empty, it becomes a empty string.
      let book = {
        title: event.target.title.value || '',
        author: event.target.author.value || '',
        isbn: event.target.isbn.value || '',
      };

      module.Book.find(book, bookView.initSearchResultsPage);

      // COMMENT: Why are these values set to an empty string?
      //it clears the form for the next search. 
      event.target.title.value = '';
      event.target.author.value = '';
      event.target.isbn.value = '';
    })
  }

  // COMMENT: What is the purpose of this method?
  //renders the results of the search on the page
  bookView.initSearchResultsPage = function() {
    app.showOnly('.search-results');
    $('#search-list').empty();

    // COMMENT: Explain how the .forEach() method is being used below.
    //this takes each book and passes it through the handlebar templates to be able to append it on the page
    module.Book.all.forEach(book => $('#search-list').append(book.toHtml()));
    $('.detail-button a').text('Add to list').attr('href', '/');
    $('.detail-button').on('click', function(e) {
      // COMMENT: Explain the following line of code.
      //This is traversing the DOM so it can get the data for the book_id in the handlebars template for detail-button -> the data-bookid attritbute with the book_id as its data (which is the parameter for the next function, findOne. I think the idea is to post that book into the database.
      module.Book.findOne($(this).parent().parent().parent().data('bookid'))
    });
  }

  module.bookView = bookView;
})(app)

