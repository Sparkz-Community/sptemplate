const {packages: {lodash: {lget, lset}}} = require('@iy4u/common-utils');


const setCompanyData = (context) => {
  let state = context.params.query.state || {};
  if (typeof state === 'string' && /\{|\}|\[|\]/.test(state)) state = JSON.parse(state);

  let accountId = lget(state, 'accountId');
  if (accountId) {
    lset(context, 'params.companyData.$addToSet.accounts', accountId);
  }
  return context;
};

module.exports = function (app) {
  app.service('quickbooks/authentication').hooks({
    before: {
      all: [],
      find: [
        setCompanyData,
      ],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },

    after: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },

    error: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },
  });
};
