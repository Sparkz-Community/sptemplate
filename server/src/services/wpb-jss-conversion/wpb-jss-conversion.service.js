// Initializes the `wpb-jss-conversion` service on path `/wpb-jss-conversion`
const { WpbJssConversion } = require('./wpb-jss-conversion.class');
const hooks = require('./wpb-jss-conversion.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/wpb-jss-conversion', new WpbJssConversion(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('wpb-jss-conversion');

  service.hooks(hooks);
};
