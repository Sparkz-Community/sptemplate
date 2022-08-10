const {fastJoin} = require('feathers-hooks-common');

const {hooks: {relate}, utils: {coreCall}} = require('@iy4u/common-server-lib');
const {packages: {lodash: {lget, lset}}} = require('@iy4u/common-utils');
const {setField} = require('feathers-authentication-hooks');

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});

const relateParticipantConfig = {
  paramsName: 'relateParticipant',
  herePath: 'participants',
  therePath: 'rooms',
  thereService: 'participants',
};

const roomResolvers = {
  joins: {
    // eslint-disable-next-line no-unused-vars
    participants: ($select, customParams = {}) => async (room, context) => {
      if (room.participants && room.participants.length) {
        let params = {
          query: {
            $client: {
              ...customParams
            },
            _id: {
              $in: room.participants,
            },
          },
        };
        if ($select) {
          lset(params, 'query.$select', $select);
        }
        const participants = await coreCall(context, 'participants').find({
          ...params,
          paginate: false,
        })
          .catch(err => {
            console.error('error joining participant to rooms: ' + err.message);
          });
        lset(room, '_fastjoin.participants', participants);
      }
    },
    chats: ($select, customParams = {}) => async (room, context) => {
      if (room.chats && room.chats.length) {
        let params = {
          query: {
            $client: {
              ...customParams
            },
            _id: {
              $in: room.chats,
            },
          },
        };
        if ($select) {
          lset(params, 'query.$select', $select);
        }
        const chats = await coreCall(context, 'chats').find({
          ...params,
          paginate: false,
        })
          .catch(err => {
            console.error('error joining chat to rooms: ' + err.message);
          });
        lset(room, '_fastjoin.chats', chats);
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
      relate('mtm', relateParticipantConfig),
    ],
    update: [
      setEnvironment,
      relate('mtm', relateParticipantConfig),
    ],
    patch: [
      setEnvironment,
      relate('mtm', relateParticipantConfig),
    ],
    remove: [
      relate('mtm', relateParticipantConfig),
    ],
  },

  after: {
    all: [
      fastJoin(
        roomResolvers,
        context => {
          let query = {};
          if (lget(context, ['params', 'roomResolversQuery'])) {
            Object.keys(roomResolvers.joins).forEach(key => {
              let val = lget(context, ['params', 'roomResolversQuery', key], false);
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
      relate('mtm', relateParticipantConfig),
    ],
    update: [
      relate('mtm', relateParticipantConfig),
    ],
    patch: [
      relate('mtm', relateParticipantConfig),
    ],
    remove: [
      relate('mtm', relateParticipantConfig),
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
