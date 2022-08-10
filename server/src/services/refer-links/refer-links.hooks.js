const {hooks: {relate}} = require('@iy4u/common-server-lib');
const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');
const {setField} = require('feathers-authentication-hooks');

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});

const relateSubjectId = async context => {
  let config = {
    paramsName: 'relateSubjectIdConfig',
    herePath: 'subjectId',
    therePath: 'referLinks',
    thereService: lget(context, 'result.subjectName'),
  };
  await relate('otm', config)(context);
};

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      setEnvironment,
      relateSubjectId,
    ],
    update: [
      setEnvironment,
      relateSubjectId,
    ],
    patch: [
      setEnvironment,
      relateSubjectId,
    ],
    remove: [
      relateSubjectId,
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      relateSubjectId,
    ],
    update: [
      relateSubjectId,
    ],
    patch: [
      relateSubjectId,
    ],
    remove: [
      relateSubjectId,
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
