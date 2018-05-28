'use strict';

var app = app || {};

(function (module) {
  const adminView = {};

  adminView.initAdminPage = function (ctx, next) {
    app.showOnly('.admin-view');

    $('#admin-form').on('submit', function(event) {
      event.preventDefault();
      let token = event.target.passphrase.value;

      // DONE:
      // Is the token cleared out of local storage? The token is not saved to local storage, only the boolean to indicate whether or not the token is a match.
      // Do you agree or disagree with this structure? It still seems poor, becuase a naughty user can manipulate their own local storage to bypass the security.
      $.get(`${app.ENVIRONMENT.apiUrl}/api/v1/admin`, {token})
        .then(res => {
          if(res) {
            localStorage.token = true;
            page('/');
          } else {
            console.error('Invalid Login.');
          }
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