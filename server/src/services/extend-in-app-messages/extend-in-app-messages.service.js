// Initializes the `users` service on path `/users`
const {extendInAppMessages} = require('./extend-in-app-messages.class');
const extendModel = require('../../models/extend-in-app-messages.model');
const hooks = require('./extend-in-app-messages.hooks');
const {services} = require('@ionrev/ir-messenger-server');
const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  lget(services, 'in-app-messages')(app, {
    extend_hooks: hooks,
    extend_schema: extendModel(app),
    extend_class_fn: extendInAppMessages,
  });
};
