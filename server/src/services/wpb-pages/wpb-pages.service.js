// Initializes the `wpb-pages` service on path `/wpb-pages`
const { WpbPages } = require('./wpb-pages.class');
const createModel = require('../../models/wpb-pages.model');
const hooks = require('./wpb-pages.hooks.js');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate'),
    whitelist: ['$regex', '$options', '$exists'],
    events: [ 'progress' ],
  };

  // Initialize our service with any options it requires
  app.use('/wpb-pages', new WpbPages(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('wpb-pages');

  service.hooks(hooks);
};
