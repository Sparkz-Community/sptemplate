// Initializes the `wpb-css-rules` service on path `/wpb-css-rules`
const { WpbCssRules } = require('./wpb-css-rules.class');
const createModel = require('../../models/wpb-css-rules.model');
const hooks = require('./wpb-css-rules.hooks');

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
  app.use('/wpb-css-rules', new WpbCssRules(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('wpb-css-rules');

  service.hooks(hooks);
};
