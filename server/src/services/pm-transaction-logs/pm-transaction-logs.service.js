// Initializes the `pm-transaction-logs` service on path `/pm-transaction-logs`
const { PmTransactionLogs } = require('./pm-transaction-logs.class');
const createModel = require('../../models/pm-transaction-logs.model');
const hooks = require('./pm-transaction-logs.hooks');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/pm-transaction-logs', new PmTransactionLogs(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('pm-transaction-logs');

  service.hooks(hooks);
};
