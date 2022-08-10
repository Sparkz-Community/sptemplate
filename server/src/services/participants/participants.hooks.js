const {fastJoin} = require('feathers-hooks-common');

const {hooks: {relate}, utils: {coreCall}} = require('@iy4u/common-server-lib');
const {packages: {lodash: {lget, lset}}} = require('@iy4u/common-utils');
const {setField} = require('feathers-authentication-hooks');

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});

const relateUserConfig = {
  paramsName: 'relateUser',
  herePath: 'owner',
  therePath: 'participants',
  thereService: 'users',
};

const participantResolvers = {
  joins: {
    // eslint-disable-next-line no-unused-vars
    owner: ($select, customParams = {}) => async (participant, context) => {
      if (participant.owner) {
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
        const user = await coreCall(context, 'accounts').get(participant.owner, {
          ...params,
        })
          .catch(err => {
            console.error('error joining account to participant: ' + err.message);
          });
        lset(participant, '_fastjoin.owner', user);
      }
    },

    rooms: ($select, customParams = {}) => async (participant, context) => {
      let participantRooms = lget(participant, 'rooms', []);
      if (participantRooms.length) {
        let params = {
          query: {
            $client: {
              ...customParams,
            },
            _id: {
              $in: participantRooms,
            },
          },
        };
        if ($select) {
          lset(params, 'query.$select', $select);
        }
        const rooms = await coreCall(context, 'rooms').find({
          ...params,
          paginate: false,
        })
          .catch(err => {
            console.error('error joining rooms to participant: ' + err.message);
          });
        lset(participant, '_fastjoin.rooms', rooms);
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
      relate('otm', relateUserConfig),
    ],
    update: [
      setEnvironment,
      relate('otm', relateUserConfig),
    ],
    patch: [
      setEnvironment,
      relate('otm', relateUserConfig),
    ],
    remove: [
      relate('otm', relateUserConfig),
    ],
  },

  after: {
    all: [
      fastJoin(
        participantResolvers,
        context => {
          let query = {};
          if (lget(context, ['params', 'participantResolversQuery'])) {
            Object.keys(participantResolvers.joins).forEach(key => {
              let val = lget(context, ['params', 'participantResolversQuery', key], false);
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
      relate('otm', relateUserConfig),
    ],
    update: [
      relate('otm', relateUserConfig),
    ],
    patch: [
      relate('otm', relateUserConfig),
    ],
    remove: [
      relate('otm', relateUserConfig),
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
