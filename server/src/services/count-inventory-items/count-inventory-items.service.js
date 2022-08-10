// Initializes the `count-inventory-items` service on path `/count-inventory-items`
const { CountInventoryItems } = require('./count-inventory-items.class');
const createModel = require('../../models/count-inventory-items.model');
const hooks = require('./count-inventory-items.hooks');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate'),
  };

  // Initialize our service with any options it requires
  app.use('/count-inventory-items', new CountInventoryItems(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('count-inventory-items');

  service.hooks(hooks);
};
