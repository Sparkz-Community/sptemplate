// Initializes the `wpb-elements` service on path `/wpb-elements`
const { WpbElements } = require('./wpb-elements.class');
const createModel = require('../../models/wpb-elements.model');
const hooks = require('./wpb-elements.hooks');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const { elementModel, discriminators } = createModel(app, {connection});
  const options = {
    Model: elementModel,
    paginate: app.get('paginate'),
    discriminators: discriminators
  };

  // Initialize our service with any options it requires
  app.use('/wpb-elements', new WpbElements(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('wpb-elements');

  service.hooks(hooks);
};
