// Initializes the `users` service on path `/users`
const {extendNotifications} = require('./extend-notifications.class');
const extendModel = require('../../models/extend-notifications.model');
const hooks = require('./extend-notifications.hooks');
const {services} = require('@iy4u/common-server-lib');
const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  lget(services, 'notifications')(app, {
    extend_hooks: hooks,
    extend_schema: extendModel(app),
    extend_class_fn: extendNotifications,
  });
};
