'use strict';

var app = app || {};

(function (module) {
  const adminView = {};

  adminView.initAdminPage = function (ctx, next) {
    app.showOnly('.admin-view');

    $('#admin-form').on('submit', function(event) {
      event.preventDefault();
      let token = event.target.passphrase.value;

      // COMDONE: Is the token cleared out of local storage? Do you agree or disagree with this structure?
      //I don't see the token getting cleared out of local storage so I don't consider the structure to be secure enough for an actual admin account as there are still vulnerabilities within the client that can be manipulated to access admin functionality.
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
    });
  };

  adminView.verify = function(ctx, next) {
    if(!localStorage.token) $('.admin').addClass('admin-only');
    else $('.admin').show();
    next();
  };

  module.adminView = adminView;
})(app);