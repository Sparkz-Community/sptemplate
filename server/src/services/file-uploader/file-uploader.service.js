// Initializes the `fileUploader` service on path `/file-uploader`
const { FileUploader } = require('./file-uploader.class');
const createModel = require('../../models/file-uploader.model');
const hooks = require('./file-uploader.hooks');
const uploadMiddleware = require('../../middleware/upload');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate'),
  };

  // Initialize our service with any options it requires
  app.use('/file-uploader',
    uploadMiddleware({
      app,
      fileKeyName: 'file',
      mimetypes: null // optional - array of mimetypes to allow
    }),
    new FileUploader(options, app)
  );

  // Get our initialized service so that we can register hooks
  const service = app.service('file-uploader');

  service.hooks(hooks);
};
