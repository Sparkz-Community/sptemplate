

import feathersClient from '../../api/feathers-client';
import { defineStore, BaseModel } from 'feathers-pinia';


export class Counts extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }

  // Define default properties here
  static instanceDefaults() {
    return {
      description: undefined,
      boardTemplate: undefined,
      board: undefined,
      inventory: undefined,
      countInventoryItems: [],
    };
  }
}

const servicePath = 'counts';
const useStore = defineStore({
  Model: Counts,
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

