// Initializes the `users` service on path `/users`
const {extendLogins} = require('./extend-logins.class');
const extendModel = require('../../models/extend-users.model');
const hooks = require('./extend-logins.hooks');
const {services} = require('@iy4u/common-server-lib');
const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  lget(services, 'logins')(app, {
    extend_hooks: hooks,
    extend_schema: extendModel(app),
    extend_class_fn: extendLogins,
  });
};
