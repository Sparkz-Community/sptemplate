// Initializes the `store-templates` service on path `/store-templates`
const { StoreTemplates } = require('./store-templates.class');
const createModel = require('../../models/store-templates.model');
const hooks = require('./store-templates.hooks');

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
  app.use('/store-templates', new StoreTemplates(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('store-templates');

  service.hooks(hooks);
};
