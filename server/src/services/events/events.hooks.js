const {fastJoin} = require('feathers-hooks-common');

const {hooks: {relate}, utils: {coreCall}} = require('@iy4u/common-server-lib');
const {packages: {lodash: {lget, lset}, omitDeep}} = require('@iy4u/common-utils');

const {setField} = require('feathers-authentication-hooks');

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});


const relateEventTemplateConfig = {
  paramsName: 'relateEventTemplate',
  herePath: 'eventTemplate',
  therePath: 'events',
  thereService: 'event-templates',
};

const eventResolvers = {
  joins: {
    subjectId: ($select, customParams = {}) => async (event, context) => {
      let subjectId = lget(event, 'subjectId');
      if (subjectId) {
        try {
          let subjectModel = lget(event, 'subjectModel');
          let params = {
            $client: {
              ...customParams
            }
          };
          if ($select) {
            lset(params, 'query.$select', $select);
          }
          let result = await coreCall(context, subjectModel).get(subjectId, params);
          lset(event, '_fastjoin.subjectId', result);
        } catch (e) {
          console.log(e);
        }
      }
    },
    createdUpdatedBy: ($select, customParams = {}) => async (event, context) => {
      let createdBy = coreCall(context, 'users').find({
        query: {
          $client: {
            ...customParams
          },
          _id: {$in: lget(event, 'createdBy', [])}
        },
        paginate: false,
      });

      let updatedBy = coreCall(context, 'users').find({
        query: {
          $client: {
            ...customParams
          },
          _id: {$in: lget(event, 'updatedBy', [])}
        },
        paginate: false,
      });

      await Promise.all([createdBy, updatedBy]).then((res) => {
        omitDeep(res, 'password');
        lset(event, '_fastjoin.createdBy', lget(res, '[0][0]'));
        lset(event, '_fastjoin.updatedBy', lget(res, '[1][0]'));
      }).catch((err) => {
        return err;
      });
    },
    eventTemplate: ($select, customParams = {}) => async (event, context) => {
      if (event.eventTemplate) {
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
        const eventTemplate = await coreCall(context, 'event-templates').get(event.eventTemplate, {
          ...params,
        })
          .catch(err => {
            console.error('error joining eventTemplate to event: ' + err.message);
          });
        lset(event, '_fastjoin.eventTemplate', eventTemplate);
      }
    },
    parent: ($select, customParams = {}) => async (event, context) => {
      if (event.parent) {
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
        const parent = await coreCall(context, 'events').get(event.parent, {
          ...params,
        })
          .catch(err => {
            console.error('error joining parent to event: ' + err.message);
          });
        lset(event, '_fastjoin.parent', parent);
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
      relate('otm', relateEventTemplateConfig),
    ],
    update: [
      setEnvironment,
      relate('otm', relateEventTemplateConfig),
    ],
    patch: [
      setEnvironment,
      relate('otm', relateEventTemplateConfig),
    ],
    remove: [
      relate('otm', relateEventTemplateConfig),
    ],
  },

  after: {
    all: [
      fastJoin(
        eventResolvers,
        context => {
          let query = {};
          if (lget(context, ['params', 'eventResolversQuery'])) {
            Object.keys(eventResolvers.joins).forEach(key => {
              let val = lget(context, ['params', 'eventResolversQuery', key], false);
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
      relate('otm', relateEventTemplateConfig),
    ],
    update: [
      relate('otm', relateEventTemplateConfig),
    ],
    patch: [
      relate('otm', relateEventTemplateConfig),
    ],
    remove: [
      relate('otm', relateEventTemplateConfig),
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
