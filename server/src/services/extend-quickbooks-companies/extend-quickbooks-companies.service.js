// Initializes the `extend-quickbooks-companies` service on path `/extend-quickbooks-companies`
const {ExtendQuickbooksCompanies} = require('./extend-quickbooks-companies.class');
const extendModel = require('../../models/extend-quickbooks-companies.model');
const hooks = require('./extend-quickbooks-companies.hooks');

const {services} = require('@iy4u/feathers-quickbooks');

module.exports = function (app) {
  services.companies(app, {
    extend_hooks: hooks,
    extend_schema: extendModel(app),
    extend_class_fn: ExtendQuickbooksCompanies,
  });
};
