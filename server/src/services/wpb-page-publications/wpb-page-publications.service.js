// Initializes the `wpb-page-publications` service on path `/wpb-page-publications`
const { WpbPagePublications } = require('./wpb-page-publications.class');
const createModel = require('../../models/wpb-page-publications.model');
const hooks = require('./wpb-page-publications.hooks');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate'),
    whitelist: ['$regex', '$options', '$exists', '$select'],
    multi: true
  };

  // Initialize our service with any options it requires
  app.use('/wpb-page-publications', new WpbPagePublications(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('wpb-page-publications');

  service.hooks(hooks);
};
