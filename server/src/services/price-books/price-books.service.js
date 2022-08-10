// Initializes the `price-books` service on path `/price-books`
const { PriceBooks } = require('./price-books.class');
const createModel = require('../../models/price-books.model');
const hooks = require('./price-books.hooks');

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
  app.use('/price-books', new PriceBooks(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('price-books');

  service.hooks(hooks);
};
