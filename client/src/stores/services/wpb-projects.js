import feathersClient from '../../api/feathers-client';
import { defineStore, BaseModel } from 'feathers-pinia';

// eslint-disable-next-line no-undef

export class WpbProjects extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }

  // Define default properties here
  static instanceDefaults () {
    return {
      name: undefined,
      pages: [],
      styleSheet: undefined,
      accessibleBy: 'owner',
      sharedAccessIds: [],
      visibility: 'private',
      ownerId: undefined,
      modelName: undefined
    };
  }
}

const servicePath = 'wpb-projects';
const useStore = defineStore({
  Model: WpbProjects,
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
