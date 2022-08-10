const {setField} = require('feathers-authentication-hooks');
const {relate, joinHooks: {fJoinHook}} = require('@iy4u/common-server-lib').hooks;

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});

const relateParentsConfig = {
  herePath: 'parent',
  therePath: 'children',
  thereService: 'gl-accounts',
};

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      setEnvironment,
      relate('otm',relateParentsConfig)
    ],
    update: [
      setEnvironment,
      relate('otm',relateParentsConfig)
    ],
    patch: [
      setEnvironment,
      relate('otm',relateParentsConfig)
    ],
    remove: [relate('otm',relateParentsConfig)]
  },

  after: {
    all: [
      fJoinHook('parent', 'gl-accounts'),
      fJoinHook('children', 'gl-accounts'),
    ],
    find: [],
    get: [],
    create: [ relate('otm',relateParentsConfig)],
    update: [ relate('otm',relateParentsConfig)],
    patch: [ relate('otm',relateParentsConfig)],
    remove: [ relate('otm',relateParentsConfig)]
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
