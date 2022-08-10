// Initializes the `ir-requests` service on path `/ir-requests`
const { IrRequests } = require('./ir-requests.class');
const createModel = require('../../models/ir-requests.model');
const hooks = require('./ir-requests.hooks');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate'),
  };

  // Initialize our service with any options it requires
  app.use('/ir-requests', new IrRequests(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('ir-requests');

  service.hooks(hooks);
};
