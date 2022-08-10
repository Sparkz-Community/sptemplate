const {setField} = require('feathers-authentication-hooks');
const {relate, joinHooks: {fJoinHook}} = require('@iy4u/common-server-lib/lib/hooks');

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});

const relateInventoryConfig = {
  herePath: 'inventory',
  therePath: 'inventoryItems',
  thereService: 'inventories',
};
const relateProductConfig = {
  herePath: 'product',
  therePath: 'inventoryItems',
  thereService: 'products',
};

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      setEnvironment,
      relate('otm', relateInventoryConfig),
      relate('otm', relateProductConfig),
    ],
    update: [
      setEnvironment,
      relate('otm', relateInventoryConfig),
      relate('otm', relateProductConfig),
    ],
    patch: [
      setEnvironment,
      relate('otm', relateInventoryConfig),
      relate('otm', relateProductConfig),
    ],
    remove: [
      relate('otm', relateInventoryConfig),
      relate('otm', relateProductConfig),
    ]
  },

  after: {
    all: [
      fJoinHook('inventory', 'inventories'),
      fJoinHook('product', 'products'),
      fJoinHook('counts', 'counts')
    ],
    find: [],
    get: [],
    create: [
      relate('otm', relateInventoryConfig),
      relate('otm', relateProductConfig),
    ],
    update: [
      relate('otm', relateInventoryConfig),
      relate('otm', relateProductConfig),
    ],
    patch: [
      relate('otm', relateInventoryConfig),
      relate('otm', relateProductConfig),
    ],
    remove: [
      relate('otm', relateInventoryConfig),
      relate('otm', relateProductConfig),
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
