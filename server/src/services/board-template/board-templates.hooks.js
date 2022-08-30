const {setField} = require('feathers-authentication-hooks');
const {fastJoin} = require('feathers-hooks-common');

const taskListOwnerResolvers = require('../../hooks/taskListOwnerResolvers');
const {packages: {lodash: {lget, lset}}} = require('@iy4u/common-utils');
const {
  hooks: {
    relate,
    joinHooks: {fJoinHook},
  },
  // utils: {coreCall}
} = require('@iy4u/common-server-lib');


const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});


const relateOwnerConfig = {
  herePath: 'owner',
  therePath: 'boardTemplates',
  thereService: 'accounts',
  noTransaction: true,
};
//lget(context,['params','user','_fastjoin','logins','active','accounts','owns','active'])
const setOwner = setField({
  from: 'params.user._fastjoin.logins.active.accounts.owns.active',
  as: 'data.owner',
});


module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      setEnvironment, setOwner,
      relate('otm', relateOwnerConfig),
    ],
    update: [
      setEnvironment, setOwner,
      relate('otm', relateOwnerConfig),
    ],
    patch: [
      setEnvironment, setOwner,
      relate('otm', relateOwnerConfig),
    ],
    remove: [
      relate('otm', relateOwnerConfig),
    ],
  },

  after: {
    all: [
      fastJoin(
        taskListOwnerResolvers,
        context => {
          let query = {};
          if (lget(context, ['params', 'listCreatorResolversQuery'])) {
            Object.keys(taskListOwnerResolvers.joins).forEach(key => {
              let val = lget(context, ['params', 'listCreatorResolversQuery', key], false);
              if (val) lset(query, key, val);
            });
          }
          return query;
        },
      ),
      fJoinHook('owner', 'accounts'),
    ],
    find: [],
    get: [],
    create: [relate('otm', relateOwnerConfig)],
    update: [relate('otm', relateOwnerConfig)],
    patch: [relate('otm', relateOwnerConfig)],
    remove: [relate('otm', relateOwnerConfig)],
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
};
