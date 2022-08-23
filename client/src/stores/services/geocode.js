import feathersClient from '../../api/feathers-client';
import { defineStore, BaseModel } from 'feathers-pinia';

export class Geocode extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }

  // Define default properties here
  static instanceDefaults() {
    return {
      input: ''
    };
  }
}

const servicePath = 'geocode';
const useStore = defineStore({
  Model: Geocode,
  servicePath,
  clients: { api: feathersClient },
  idField: 'place_id',
  state() {
    return {};
  },
  getters: {},
  actions: {},
});

const requestHook = context => {
  // On success, context.params.googleMaps will include a `response`
  // eslint-disable-next-line no-console
  console.log('requestHook: ', context);
};
const successfullResponseHook = context => {
  // On success, context.params.googleMaps will include a `response`
  // eslint-disable-next-line no-console
  console.log('successfullResponseHook: ', context);
};

// Setup the client-side Feathers hooks.
feathersClient.service(servicePath).hooks({
  before: {
    all: [],
    find: [requestHook],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  after: {
    all: [],
    find: [successfullResponseHook],
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
