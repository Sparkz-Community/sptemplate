// Initializes the `refer-links` service on path `/refer-links`
const { ReferLinks } = require('./refer-links.class');
const createModel = require('../../models/refer-links.model');
const hooks = require('./refer-links.hooks');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/refer-links', new ReferLinks(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('refer-links');

  service.hooks(hooks);
};
