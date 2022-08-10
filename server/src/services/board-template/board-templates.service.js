// Initializes the `board-template` service on path `/board-template`
const { BoardTemplates } = require('./board-templates.class');
const createModel = require('../../models/board-templates.model');
const hooks = require('./board-templates.hooks');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate'),
    whitelist: ['$options','$regex'],
    multi: true,
  };

  // Initialize our service with any options it requires
  app.use('/board-templates', new BoardTemplates(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('board-templates');

  service.hooks(hooks);
};
