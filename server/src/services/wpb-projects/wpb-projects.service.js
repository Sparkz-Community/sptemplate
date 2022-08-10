// Initializes the `wpb-projects` service on path `/wpb-projects`
const { WpbProjects } = require('./wpb-projects.class');
const createModel = require('../../models/wpb-projects.model');
const hooks = require('./wpb-projects.hooks');

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
  app.use('/wpb-projects', new WpbProjects(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('wpb-projects');

  service.hooks(hooks);
};
