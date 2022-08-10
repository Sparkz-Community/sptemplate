const {relate} = require('@iy4u/common-server-lib/lib/hooks');

const relateDashboardReportsConfig = {
  paramsName: 'relateDashboardReports',
  herePath: 'reports',
  therePath: 'dashboards',
  thereService: 'dashboard-reports',
};

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      relate('mtm', relateDashboardReportsConfig),
    ],
    update: [
      relate('mtm', relateDashboardReportsConfig),
    ],
    patch: [
      relate('mtm', relateDashboardReportsConfig),
    ],
    remove: [
      relate('mtm', relateDashboardReportsConfig),
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      relate('mtm', relateDashboardReportsConfig),
    ],
    update: [
      relate('mtm', relateDashboardReportsConfig),
    ],
    patch: [
      relate('mtm', relateDashboardReportsConfig),
    ],
    remove: [
      relate('mtm', relateDashboardReportsConfig),
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
