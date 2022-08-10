const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = {
  'host': process.env.HOST || '0.0.0.0',
  'port': process.env.PORT || 3030,
  quickbooks: {
    'configurationEndpoint': lget(process.env, 'QUICKBOOKS_CONFIGURATION_ENDPOINT', 'https://developer.api.intuit.com/.well-known/openid_configuration/'),
  },
};
