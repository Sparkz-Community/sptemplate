const {setField} = require('feathers-authentication-hooks');
const {relate, joinHooks: {fJoinHook}} = require('@iy4u/common-server-lib/lib/hooks');

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});

const relateWarehouseConfig = {
  herePath: 'warehouse',
  therePath: 'inventories',
  thereService: 'warehouses',
};

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      setEnvironment,
      relate('otm', relateWarehouseConfig)
    ],
    update: [
      setEnvironment,
      relate('otm', relateWarehouseConfig)
    ],
    patch: [
      setEnvironment,
      relate('otm', relateWarehouseConfig)
    ],
    remove: [
      relate('otm', relateWarehouseConfig)
    ]
  },

  after: {
    all: [
      fJoinHook('warehouse', 'warehouses'),
      fJoinHook('counts', 'counts'),
      fJoinHook('inventoryItems', 'inventory-items'),
    ],
    find: [],
    get: [],
    create: [
      relate('otm', relateWarehouseConfig)
    ],
    update: [
      relate('otm', relateWarehouseConfig)
    ],
    patch: [
      relate('otm', relateWarehouseConfig)
    ],
    remove: [
      relate('otm', relateWarehouseConfig)
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
