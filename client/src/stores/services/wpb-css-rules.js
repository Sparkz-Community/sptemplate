import feathersClient from '../../api/feathers-client';
import { defineStore, BaseModel } from 'feathers-pinia';

// eslint-disable-next-line no-undef

export class WpbCssRules extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }

  // Define default properties here
  static instanceDefaults() {
    return {
      styles: undefined,
      name: undefined,
      inPages: undefined,
      attachedTo: [],
      modelName: undefined
    };
  }
}

const servicePath = 'wpb-css-rules';
const useStore = defineStore({
   Model: WpbCssRules,
  servicePath,
  clients: { api: feathersClient },
  idField: '_id',
  state() {
    return {};
  },
  getters: {},
  actions: {},
});

// Setup the client-side Feathers hooks.
feathersClient.service(servicePath).hooks({
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  after: {
    all: [],
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
});

export default useStore;
