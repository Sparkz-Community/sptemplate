// Initializes the `inventory-items` service on path `/inventory-items`
const { InventoryItems } = require('./inventory-items.class');
const createModel = require('../../models/inventory-items.model');
const hooks = require('./inventory-items.hooks');

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
  app.use('/inventory-items', new InventoryItems(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('inventory-items');

  service.hooks(hooks);
};
