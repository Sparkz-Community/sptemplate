import feathersClient from '../../api/feathers-client';
import { defineStore, BaseModel } from 'feathers-pinia';


export class Payments extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }

  // Define default properties here
  static instanceDefaults() {
    return {
      account: undefined,
      amount: 0,
      paidDate: undefined,
      status: undefined,
      memo: undefined,
      referenceNumber: undefined,

      // Quickbooks Fields:
      transferredToExternal: undefined,
      transferredToExternalDate: undefined,
      receivedFromExternal: undefined,
      receivedFromExternalDate: undefined,
    };
  }
}

const servicePath = 'payments';
const useStore = defineStore({
  Model: Payments,
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
