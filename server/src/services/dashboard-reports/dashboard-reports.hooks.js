const {relate} = require('@iy4u/common-server-lib/lib/hooks');

const relateDashboardsConfig = {
  paramsName: 'relateDashboards',
  herePath: 'dashboards',
  therePath: 'reports',
  thereService: 'dashboards',
};

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      relate('mtm', relateDashboardsConfig),
    ],
    update: [
      relate('mtm', relateDashboardsConfig),
    ],
    patch: [
      relate('mtm', relateDashboardsConfig),
    ],
    remove: [
      relate('mtm', relateDashboardsConfig),
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      relate('mtm', relateDashboardsConfig),
    ],
    update: [
      relate('mtm', relateDashboardsConfig),
    ],
    patch: [
      relate('mtm', relateDashboardsConfig),
    ],
    remove: [
      relate('mtm', relateDashboardsConfig),
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
