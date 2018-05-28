'use strict';

var app = app || {};

(function (module) {
  const adminView = {};

  adminView.initAdminPage = function (ctx, next) {
    app.showOnly('.admin-view');

    $('#admin-form').on('submit', function(event) {
      event.preventDefault();
      let token = event.target.passphrase.value;

      // COMMENT: Is the token cleared out of local storage? Do you agree or disagree with this structure?
      //I don't think localStorage is cleared here.
      $.get(`${app.ENVIRONMENT.apiUrl}/api/v1/admin`, {token})
        .then(res => {
          if(res) {
            localStorage.token = true;
            page('/');//I'm not sure of this part. I think its saying that if the request succeeded then the page would display all books but it also would need a sort of verification to get into the admin page.
          } else {
            console.error('Invalid Login.');
          }
        })
        .catch(() => page('/'));
    });
  };

  adminView.verify = function(ctx, next) {
    if(!localStorage.token) $('.admin').addClass('admin-only');
    else $('.admin').show();
    next();
  };

  module.adminView = adminView;
})(app);