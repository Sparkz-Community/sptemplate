// Initializes the `lists` service on path `/lists`
const { Lists } = require('./lists.class');
const createModel = require('../../models/lists.model');
const hooks = require('./lists.hooks');

// const { realtimeWrapper } = require('@feathersjs-offline/server');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate'),
    whitelist: ['$options','$regex']
  };

  // Initialize our service with any options it requires
  app.use('/lists', new Lists(options, app));
  // realtimeWrapper(app, '/lists', {});

  // Get our initialized service so that we can register hooks
  const service = app.service('lists');

  service.hooks(hooks);
};
