// Initializes the `wpb-classes` service on path `/wpb-classes`
const { WpbClasses } = require('./wpb-classes.class');
const createModel = require('../../models/wpb-classes.model');
const hooks = require('./wpb-classes.hooks');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate'),
    multi: ['patch']
  };

  // Initialize our service with any options it requires
  app.use('/wpb-classes', new WpbClasses(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('wpb-classes');

  service.hooks(hooks);
};
