// Initializes the `invoices` service on path `/invoices`
const { Invoices } = require('./invoices.class');
const createModel = require('../../models/invoices.model');
const hooks = require('./invoices.hooks');

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
  app.use('/invoices', new Invoices(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('invoices');

  service.hooks(hooks);
};
