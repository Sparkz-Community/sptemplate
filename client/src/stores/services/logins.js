import feathersClient from '../../api/feathers-client';
import { defineStore, BaseModel } from 'feathers-pinia';

// eslint-disable-next-line no-undef
const {lodash} = require('@sparkz-community/common-client-lib');
const {$lget, $lset} = lodash;

export class Logins extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }

  // Define default properties here
  static instanceDefaults(/*data, {models, store}*/) {
    return {
      email: undefined,
      name: undefined,
      phone: undefined,
      roles: [],
      phones: [],
      addresses: [],
      accounts: {
        owns: {
          ids: [],
          active: undefined
        },
        memberOf: []
      },
      settings: {
        theme: {
          darkMode: undefined,
          '--q-color-primary': undefined,
          '--q-color-secondary': undefined,
          '--q-color-accent': undefined,
          '--q-color-dark': undefined,

          '--q-color-positive': undefined,
          '--q-color-negative': undefined,
          '--q-color-info': undefined,
          '--q-color-warning': undefined,
        },
      },
      createdBy: undefined,
      updatedBy: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      avatar: undefined,
      banner: undefined,
      images: undefined,
    };
  }

  static setupInstance(data, { models }) {
    if ($lget(data, '_fastjoin.accounts.owns.ids', []).length) {
      $lset(data, '_fastjoin.accounts.owns.ids', $lget(data, '_fastjoin.accounts.owns.ids', []).map(account => {
        let newAccount = new models.api.Accounts(account);
        newAccount.addToStore();
        return newAccount;
      }));
    }
    if ($lget(data, '_fastjoin.accounts.owns.active')) {
      let newAccount = new models.api.Accounts($lget(data, '_fastjoin.accounts.owns.active'));
      newAccount.addToStore();
      $lset(data, '_fastjoin.accounts.owns.active', newAccount);
    }

    let createdAt = $lget(data, 'createdAt');
    if (typeof createdAt === 'string') {
      $lset(data, 'createdAt', new Date(createdAt));
    }
    let updatedAt = $lget(data, 'updatedAt');
    if (typeof updatedAt === 'string') {
      $lset(data, 'updatedAt', new Date(updatedAt));
    }
    return data;
  }
}

const servicePath = 'logins';
const useStore = defineStore({
  Model: Logins,
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
