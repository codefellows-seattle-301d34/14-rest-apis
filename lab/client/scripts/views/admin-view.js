'use strict';

var app = app || {};

// I commented out these lines because they were also included in book.js and 'use strict' was complaining.
// const ENV = {};

// ENV.isProduction = window.location.protocol === 'https:';
// ENV.productionApiUrl = 'https://ta-booklist.herokuapp.com:3000';
// ENV.developmentApiUrl = 'http://localhost:3000';
// ENV.apiUrl = ENV.isProduction ? ENV.productionApiUrl : ENV.developmentApiUrl;

(function (module) {
  const adminView = {};

  adminView.initAdminPage = function (ctx, next) {
    $('.nav-menu').slideUp(350);
    $('.admin-view').show();

    $('#admin-form').on('submit', function(event) {
      event.preventDefault();
      let token = event.target.passphrase.value;

      // COMMENT: Is the token cleared out of local storage? Do you agree or disagree with this structure?
      // ANSWER: No it's not. It should be, either on initial page load (or reload, IMO). Also, this code sets localStorage.token to true regardless of what's returned by the $.get call.  THAT call was broken too (both tokens were strings so parseInt'ing one resulted in false being returned all the time). I fixed that but the logged in state still persists between sessions.
      localStorage.clear();
      $.get(`${app.ENV.apiUrl}/api/v1/admin`, {token})
        .then(res => {
          if (res === true) localStorage.token = true;
          page('/');
        })
        .catch(() => page('/'));
    })
  };

  adminView.verify = function(ctx, next) {
    if(!localStorage.token) $('.admin').addClass('admin-only');
    else $('.admin').show();
    next();
  }

  module.adminView = adminView;
})(app)