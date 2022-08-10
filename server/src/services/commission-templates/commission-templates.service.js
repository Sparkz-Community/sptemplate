// Initializes the `commission-templates` service on path `/commission-templates`
const {CommissionTemplates} = require('./commission-templates.class');
const createModel = require('../../models/commission-templates.model');
const hooks = require('./commission-templates.hooks');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate'),
    whitelist: ['$options', '$regex']
  };

  // Initialize our service with any options it requires
  app.use('/commission-templates', new CommissionTemplates(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('commission-templates');

  service.hooks(hooks);
};
