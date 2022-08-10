// Initializes the `stores` service on path `/stores`
const { Stores } = require('./stores.class');
const createModel = require('../../models/stores.model');
const hooks = require('./stores.hooks');

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
  app.use('/stores', new Stores(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('stores');

  service.hooks(hooks);
};
