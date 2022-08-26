import feathersClient from '../../api/feathers-client';
import { defineStore, BaseModel } from 'feathers-pinia';

// eslint-disable-next-line no-undef
// const {get, set} = require('lodash');

export class Wallets extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }

  // Define default properties here
  static instanceDefaults(/*data, {models, store}*/) {
    return {
      // name: '',
      // createdBy: null,
      // updatedBy: null,
      // active: true
    };
  }

  static setupInstance(data, /*{ models }*/) {

    return data;
  }
}

const servicePath = 'wallets';
const useStore = defineStore({
  Model: Wallets,
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
