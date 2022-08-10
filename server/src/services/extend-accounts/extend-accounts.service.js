// Initializes the `users` service on path `/users`
const {extendAccounts} = require('./extend-accounts.class');
const extendModel = require('../../models/extend-accounts.model');
const hooks = require('./extend-accounts.hooks');
const {services} = require('@iy4u/common-server-lib');
const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  lget(services, 'accounts')(app, {
    extend_hooks: hooks,
    extend_schema: extendModel(app),
    extend_class_fn: extendAccounts,
  });
};
