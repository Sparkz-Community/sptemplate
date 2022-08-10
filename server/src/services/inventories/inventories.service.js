// Initializes the `inventories` service on path `/inventories`
const { Inventories } = require('./inventories.class');
const createModel = require('../../models/inventories.model');
const hooks = require('./inventories.hooks');

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
  app.use('/inventories', new Inventories(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('inventories');

  service.hooks(hooks);
};
