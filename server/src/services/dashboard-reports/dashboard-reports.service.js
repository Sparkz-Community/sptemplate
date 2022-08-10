// Initializes the `dashboard-reports` service on path `/dashboard-reports`
const { DashboardReports } = require('./dashboard-reports.class');
const createModel = require('../../models/dashboard-reports.model');
const hooks = require('./dashboard-reports.hooks');

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
  app.use('/dashboard-reports', new DashboardReports(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('dashboard-reports');

  service.hooks(hooks);
};
