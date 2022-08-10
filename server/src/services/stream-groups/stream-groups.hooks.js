const {hooks: {relate}, utils: {coreCall}} = require('@iy4u/common-server-lib');
const {setField} = require('feathers-authentication-hooks');
const {fastJoin} = require('feathers-hooks-common');

const {packages: {lodash: {lget, lset}}} = require('@iy4u/common-utils');

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});

const relateRoomConfig = {
  paramsName: 'relateRoom',
  herePath: 'room',
  therePath: 'streamGroups',
  thereService: 'rooms',
};

const streamGroupResolvers = {
  joins: {
    room: ($select, customParams = {}) => async (streamGroup, context) => {
      if (streamGroup.room) {
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
        const room = await coreCall(context, 'rooms').get(streamGroup.room, {
          ...params,
        })
          .catch(err => {
            console.error('error joining room to streamGroup: ' + err.message);
          });
        lset(streamGroup, '_fastjoin.room', room);
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
      relate('otm', relateRoomConfig),
    ],
    update: [
      setEnvironment,
      relate('otm', relateRoomConfig),
    ],
    patch: [
      setEnvironment,
      relate('otm', relateRoomConfig),
    ],
    remove: [
      relate('otm', relateRoomConfig),
    ],
  },

  after: {
    all: [
      fastJoin(
        streamGroupResolvers,
        context => {
          let query = {};
          if (lget(context, ['params', 'streamGroupResolversQuery'])) {
            Object.keys(streamGroupResolvers.joins).forEach(key => {
              let val = lget(context, ['params', 'streamGroupResolversQuery', key], false);
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
      relate('otm', relateRoomConfig),
    ],
    update: [
      relate('otm', relateRoomConfig),
    ],
    patch: [
      relate('otm', relateRoomConfig),
    ],
    remove: [
      relate('otm', relateRoomConfig),
    ],
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
