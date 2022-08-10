const {
  hooks: {coreAuthentication},
} = require('@iy4u/common-server-lib');

const {disallow} = require('feathers-hooks-common');

module.exports = {
  before: {
    all: [],
    find: [
      disallow(),
    ],
    get: [
      disallow(),
    ],
    create: [
      coreAuthentication({
        required: [
          {service: 'authentication', strategies: ['jwt']},
          // {service: 'integrationAuth', strategies: ['jwt']},
        ],
        optional: [
          // {service: 'authentication', strategies: ['jwt']},
          // {service: 'integrationAuth', strategies: ['jwt']},
        ],
      }),
    ],
    update: [
      disallow(),
    ],
    patch: [
      disallow(),
    ],
    remove: [
      disallow(),
    ],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
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
