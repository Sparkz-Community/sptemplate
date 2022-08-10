// Initializes the `leads` service on path `/leads`
const { Leads } = require('./leads.class');
const createModel = require('../../models/leads.model');
const hooks = require('./leads.hooks');

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
  app.use('/leads', new Leads(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('leads');

  service.hooks(hooks);
};
