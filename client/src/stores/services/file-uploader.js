import feathersClient from '../../api/feathers-client';
import {defineStore, BaseModel} from 'feathers-pinia';

export class FileUploader extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }

  // Define default properties here
  static instanceDefaults(/*data, {models, store}*/) {
    return {
      name: undefined,
      file: undefined,
      originalName: undefined,
      type: undefined,
      info: {
        name: undefined,
        size: undefined,
        type: undefined,
        lastModifiedDate: undefined,
      },
      user: undefined,
      fileId: undefined,
      storage: undefined,
      uploadChannel: undefined,
    };
  }
}

const servicePath = 'file-uploader';
const useStore = defineStore({
  Model: FileUploader,
  servicePath,
  clients: {api: feathersClient},
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
    remove: [],
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
});

export default useStore;
