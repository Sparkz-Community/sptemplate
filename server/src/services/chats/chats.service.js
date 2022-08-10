// Initializes the `ac-chats` service on path `/ac-chats`
const {Chats} = require('./chats.class');
const createModel = require('../../models/chats.model');
const hooks = require('./chats.hooks');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate'),
    multi: true,
    whitelist: ['$options','$regex']
  };

  // Initialize our service with any options it requires
  app.use('/chats', new Chats(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('chats');

  service.hooks(hooks);
};
