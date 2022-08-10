// Initializes the `dashboards` service on path `/dashboards`
const { Dashboards } = require('./dashboards.class');
const createModel = require('../../models/dashboards.model');
const hooks = require('./dashboards.hooks');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate'),
    multi: true,
  };

  // Initialize our service with any options it requires
  app.use('/dashboards', new Dashboards(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('dashboards');

  service.hooks(hooks);
};
