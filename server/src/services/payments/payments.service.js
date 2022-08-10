// Initializes the `payments` service on path `/payments`
const {Payments} = require('./payments.class');
const createModel = require('../../models/payments.model');
const hooks = require('./payments.hooks');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate'),
    whitelist: ['$options', '$regex'],
  };

  // Initialize our service with any options it requires
  app.use('/payments', new Payments(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('payments');

  service.hooks(hooks);
};
