const {packages: {lodash: {lget, lset}}} = require('@iy4u/common-utils');
const {utils: {coreCall}} = require('@iy4u/common-server-lib');

const {setField} = require('feathers-authentication-hooks');
const {fastJoin} = require('feathers-hooks-common');

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});

const participantEventResolvers = {
  joins: {
    event: ($select, customParams = {}) => async (participantEvent, context) => {
      if (participantEvent.event) {
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
        const event = await coreCall(context, 'events').get(participantEvent.event, {
          ...params,
        })
          .catch(err => {
            console.error('error joining event to participantEvent: ' + err.message);
          });
        lset(participantEvent, '_fastjoin.event', event);
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
    ],
    update: [
      setEnvironment,
    ],
    patch: [
      setEnvironment,
    ],
    remove: []
  },

  after: {
    all: [
      fastJoin(
        participantEventResolvers,
        context => {
          let query = {};
          if (lget(context, ['params', 'participantEventResolversQuery'])) {
            Object.keys(participantEventResolvers.joins).forEach(key => {
              let val = lget(context, ['params', 'participantEventResolversQuery', key], false);
              if (val) lset(query, key, val);
            });
          }
          return query;
        },
      ),
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
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
