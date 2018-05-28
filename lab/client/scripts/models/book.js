'use strict';

var app = app || {};

( function ( module ) {
  function errorCallback( err ) {
    console.error( err );
    module.errorView.initErrorPage( err );
  }

  function Book( rawBookObj ) {
    Object.keys( rawBookObj ).forEach( key => this[ key ] = rawBookObj[ key ] );
  }

  Book.prototype.toHtml = function () {
    return app.render( 'book-list-temmplate', this );
  }

  Book.all = [];

  Book.loadAll = rows => Book.all = rows.sort( ( a, b ) => b.title - a.title ).map( book => new Book( book ) );

  Book.fetchAll = callback =>
    $.get( `${ app.ENVIRONMENT.apiUrl }/api/v1/books` )
      .then( Book.loadAll )
      .then( callback )
      .catch( errorCallback );

  Book.fetchOne = ( ctx, callback ) =>
    $.get( `${ app.ENVIRONMENT.apiUrl }/api/v1/books/${ ctx.params.book_id }` )
      .then( results => ctx.book = results[ 0 ] )
      .then( callback )
      .catch( errorCallback );

  Book.create = book =>
    $.post( `${ app.ENVIRONMENT.apiUrl }/api/v1/books`, book )
      .then( () => page( '/' ) )
      .catch( errorCallback );

  Book.update = ( book, bookId ) =>
    $.ajax( {
      url: `${ app.ENVIRONMENT.apiUrl }/api/v1/books/${ bookId }`,
      method: 'PUT',
      data: book,
    } )
      .then( () => page( `/books/${ bookId }` ) )
      .catch( errorCallback )

  Book.destroy = id =>
    $.ajax( {
      url: `${ app.ENVIRONMENT.apiUrl }/api/v1/books/${ id }`,
      method: 'DELETE',
    } )
      .then( () => page( '/' ) )
      .catch( errorCallback )

  // COMMENT: Where is this method invoked? What is passed in as the 'book' argument when invoked? What callback will be invoked after Book.loadAll is invoked?
  // This method is invoked in book-view.js near the bottom of the bookView.initSearchFormPage method. The 'book' argument receives a data object from the search form with the info corresponding to the initial $.get() request. The callback is bookView.initSearchResultsPage, also found in book-view.js.
  Book.find = ( book, callback ) =>
    $.get( `${ app.ENVIRONMENT.apiUrl }/api/v1/books/find`, book )
      .then( Book.loadAll )
      .then( callback )
      .catch( errorCallback )

  // COMMENT: Where is this method invoked? How does it differ from the Book.find method, above?
  // This method is invoked in book-view.js in the body of the bookView.initSearchResultsPage method. This method takes an ISBN number as a parameter, which suggests to me that it will be using that specific ID to locate a single book, where the Book.find method seemingly takes an object of book data from a form and matches all books that fit the criteria.
  Book.findOne = isbn =>
    $.get( `${ app.ENVIRONMENT.apiUrl }/api/v1/books/find/${ isbn }` )
      .then( Book.create )
      .catch( errorCallback )

  module.Book = Book;
} )( app )
