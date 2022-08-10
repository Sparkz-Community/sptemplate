// Initializes the `wallets` service on path `/wallets`
const { Wallets } = require('./wallets.class');
const createModel = require('../../models/wallets.model');
const hooks = require('./wallets.hooks');

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
  app.use('/wallets', new Wallets(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('wallets');

  service.hooks(hooks);
};
