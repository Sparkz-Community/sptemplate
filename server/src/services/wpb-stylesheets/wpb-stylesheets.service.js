// Initializes the `wpb-stylesheets` service on path `/wpb-stylesheets`
const { WpbStylesheets } = require('./wpb-stylesheets.class');
const createModel = require('../../models/wpb-stylesheets.model');
const hooks = require('./wpb-stylesheets.hooks');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate'),
    whitelist: ['$regex', '$options', '$exists'],
  };

  // Initialize our service with any options it requires
  app.use('/wpb-stylesheets', new WpbStylesheets(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('wpb-stylesheets');

  service.hooks(hooks);
};
