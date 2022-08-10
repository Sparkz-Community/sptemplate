// Initializes the `boards` service on path `/boards`
const { Boards } = require('./boards.class');
const createModel = require('../../models/boards.model');
const hooks = require('./boards.hooks');

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
  app.use('/boards', new Boards(options, app));
  // realtimeWrapper(app, '/boards', {});

  // Get our initialized service so that we can register hooks
  const service = app.service('boards');

  service.hooks(hooks);
};
