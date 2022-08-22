import feathersClient from '../../api/feathers-client';
import { defineStore, BaseModel } from 'feathers-pinia';

// eslint-disable-next-line no-undef
const {get, set} = require('lodash');

export class Chats extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }

  // Define default properties here
  static instanceDefaults(/*data, {models, store}*/) {
    return {
      text: '',
      images: [],
      videos: [],
      room: undefined,
      sender: undefined,
      parent: undefined,
      children: [],
    };
  }

  static setupInstance(data) {
    let createdAt = get(data, 'createdAt');
    if (typeof createdAt === 'string') {
      set(data, 'createdAt', new Date(createdAt));
    }
    let updatedAt = get(data, 'updatedAt');
    if (typeof updatedAt === 'string') {
      set(data, 'updatedAt', new Date(updatedAt));
    }
    return data;
  }
}

const servicePath = 'chats';
const useStore = defineStore({
  Model: Chats,
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
