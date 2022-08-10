const { setField } = require('feathers-authentication-hooks');

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment'
});

module.exports = {
  before: {
    all: [
      context => {
        context.service.options.whitelist = ['$options', '$regex'];
      },
    ],
    find: [],
    get: [],
    create: [
      setEnvironment,
    ],
    update: [
      setEnvironment,
    ],
    patch: [
      setEnvironment,
    ],
    remove: [],
  },

  after: {
    all: [
      context => {
        return context;
      },
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [
      context => {
        return context;
      },
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
