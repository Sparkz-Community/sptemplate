const {fastJoin, iff} = require('feathers-hooks-common');

const {hooks: {relate, joinHooks: {fJoinHook}}, utils: {coreCall}} = require('@iy4u/common-server-lib');
const {packages: {lodash: {lget, lset}}} = require('@iy4u/common-utils');
const {setField} = require('feathers-authentication-hooks');

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});

const relateStreamGroupConfig = {
  paramsName: 'relateStreamGroup',
  herePath: 'streamGroup',
  therePath: 'streams',
  thereService: 'stream-groups',
};

const userResolver = {
  joins: {
    children: {
      resolver: () => async (stream, context) => {
        let user = await coreCall(context, 'users').get(lget(stream, 'host'));
        lset(stream, '_fastjoin.host', user);
      }
    }
  }
};

const streamResolvers = {
  joins: {
    streamGroup: ($select, customParams = {}) => async (stream, context) => {
      if (stream.streamGroup) {
        let params = {
          query: {
            $client: {
              ...customParams
            },
          },
        };
        if ($select) {
          lset(params, 'query.$select', $select);
        }
        const streamGroup = await coreCall(context, 'stream-groups').get(stream.streamGroup, {
          ...params,
        })
          .catch(err => {
            console.error('error joining streamGroup to stream: ' + err.message);
          });
        lset(stream, '_fastjoin.streamGroup', streamGroup);
      }
    },

    host: ($select, customParams = {}) => async (stream, context) => {
      if (stream.host) {
        let params = {
          query: {
            $client: {
              ...customParams
            },
          },
        };
        if ($select) {
          lset(params, 'query.$select', $select);
        }
        const host = await coreCall(context, 'accounts').get(stream.host, {
          ...params,
        })
          .catch(err => {
            console.error('error joining host to stream: ' + err.message);
          });
        lset(stream, '_fastjoin.host', host);
      }
    },
  },
};


module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      setEnvironment,
      relate('otm', relateStreamGroupConfig),
    ],
    update: [
      setEnvironment,
      relate('otm', relateStreamGroupConfig),
    ],
    patch: [
      setEnvironment,
      relate('otm', relateStreamGroupConfig),
    ],
    remove: [
      relate('otm', relateStreamGroupConfig),
    ]
  },

  after: {
    all: [
      fJoinHook('blockedUsers', 'users'),
      iff(ctx => !!ctx.params.userJoin, fastJoin(userResolver)),
      fastJoin(
        streamResolvers,
        context => {
          let query = {};
          if (lget(context, ['params', 'streamResolversQuery'])) {
            Object.keys(streamResolvers.joins).forEach(key => {
              let val = lget(context, ['params', 'streamResolversQuery', key], false);
              if (val) lset(query, key, val);
            });
          }
          return query;
        },
      ),
    ],
    find: [],
    get: [],
    create: [
      relate('otm', relateStreamGroupConfig),
    ],
    update: [
      relate('otm', relateStreamGroupConfig),
    ],
    patch: [
      relate('otm', relateStreamGroupConfig),
    ],
    remove: [
      relate('otm', relateStreamGroupConfig),
    ]
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
