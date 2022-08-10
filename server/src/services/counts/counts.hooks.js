const {setField} = require('feathers-authentication-hooks');
const {relate, joinHooks: {fJoinHook}} = require('@iy4u/common-server-lib/lib/hooks');

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});

const relateBoardTemplateConfig = {
  herePath: 'boardTemplate',
  therePath: 'counts',
  thereService: 'board-templates',
};
const relateBoardConfig = {
  herePath: 'board',
  therePath: 'counts',
  thereService: 'boards',
};
const relateInventoryConfig = {
  herePath: 'inventory',
  therePath: 'counts',
  thereService: 'inventories',
};

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      setEnvironment,
      relate('otm', relateBoardTemplateConfig),
      relate('otm', relateBoardConfig),
      relate('otm', relateInventoryConfig),
    ],
    update: [
      setEnvironment,
      relate('otm', relateBoardTemplateConfig),
      relate('otm', relateBoardConfig),
      relate('otm', relateInventoryConfig),
    ],
    patch: [
      setEnvironment,
      relate('otm', relateBoardTemplateConfig),
      relate('otm', relateBoardConfig),
      relate('otm', relateInventoryConfig),
    ],
    remove: [
      relate('otm', relateBoardTemplateConfig),
      relate('otm', relateBoardConfig),
      relate('otm', relateInventoryConfig),
    ],
  },

  after: {
    all: [
      fJoinHook('boardTemplate', 'board-templates'),
      fJoinHook('board', 'boards'),
      fJoinHook('inventory', 'inventories'),
    ],
    find: [],
    get: [],
    create: [
      relate('otm', relateBoardTemplateConfig),
      relate('otm', relateBoardConfig),
      relate('otm', relateInventoryConfig),
    ],
    update: [
      relate('otm', relateBoardTemplateConfig),
      relate('otm', relateBoardConfig),
      relate('otm', relateInventoryConfig),
    ],
    patch: [
      relate('otm', relateBoardTemplateConfig),
      relate('otm', relateBoardConfig),
      relate('otm', relateInventoryConfig),
    ],
    remove: [
      relate('otm', relateBoardTemplateConfig),
      relate('otm', relateBoardConfig),
      relate('otm', relateInventoryConfig),
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
