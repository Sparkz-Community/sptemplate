// Initializes the `wpb-sections` service on path `/wpb-sections`
const { WpbSections } = require('./wpb-sections.class');
const createModel = require('../../models/wpb-sections.model');
const hooks = require('./wpb-sections.hooks');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate'),
    whitelist: ['$regex', '$options', '$exists']
  };

  // Initialize our service with any options it requires
  app.use('/wpb-sections', new WpbSections(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('wpb-sections');

  service.hooks(hooks);
};
