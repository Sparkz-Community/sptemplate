// Initializes the `products` service on path `/products`
const { Products } = require('./products.class');
const createModel = require('../../models/products.model');
const hooks = require('./products.hooks');

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
  app.use('/products', new Products(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('products');

  service.hooks(hooks);
};
