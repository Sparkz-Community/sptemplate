import feathersClient from '../../api/feathers-client';
import { defineStore, BaseModel } from 'feathers-pinia';

// eslint-disable-next-line no-undef
const {get, set} = require('lodash');

export class Rooms  extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }

  // Define default properties here
  static instanceDefaults() {
    return {
      name: undefined,
      streamGroups: [],
      participantEvents: [],
      chats: [],
      participants: [],

      directMessage: undefined,
    };
  }

  static setupInstance(data, { models }) {
    if (get(data, '_fastjoin.participants', []).length) {
      set(data, '_fastjoin.participants', get(data, '_fastjoin.participants', []).map(participant => new models.api.Participants(participant)));
    }
    // if ($lget(data, '_fastjoin.createdBy')) {
    //   $lset(data, '_fastjoin.createdBy', new models.api.Users($lget(data, '_fastjoin.createdBy')));
    // }
    // if ($lget(data, '_fastjoin.updatedBy')) {
    //   $lset(data, '_fastjoin.updatedBy', new models.api.Users($lget(data, '_fastjoin.updatedBy')));
    // }
    //
    // let createdAt = $lget(data, 'createdAt');
    // if (typeof createdAt === 'string') {
    //   $lset(data, 'createdAt', new Date(createdAt));
    // }
    // let updatedAt = $lget(data, 'updatedAt');
    // if (typeof updatedAt === 'string') {
    //   $lset(data, 'updatedAt', new Date(updatedAt));
    // }

    return data;
  }
}

const servicePath = 'rooms';
const useStore = defineStore({
  Model: Rooms,
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
