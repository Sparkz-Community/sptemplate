// Initializes the `funnel-responses` service on path `/funnel-responses`
const { FunnelResponses } = require('./funnel-responses.class');
const createModel = require('../../models/funnel-responses.model');
const hooks = require('./funnel-responses.hooks');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate'),
  };

  // Initialize our service with any options it requires
  app.use('/funnel-responses', new FunnelResponses(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('funnel-responses');

  service.hooks(hooks);
};
