import feathersClient from '../../api/feathers-client';
import { defineStore, BaseModel } from 'feathers-pinia';

// eslint-disable-next-line no-undef

export class Stores extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }

  // Define default properties here
  static instanceDefaults() {
    return {
      product: undefined,
      saleReps: [],
      ownership: {
        owners: [],
      },
      membership:[],
      quickbooksConnection: undefined,
      glClass: undefined,
      glDepartment: undefined,
    };
  }
}

const servicePath = 'stores';
const useStore = defineStore({
  Model: Stores,
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
