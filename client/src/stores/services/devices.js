import feathersClient from '../../api/feathers-client';
import {stores, classes} from '@sparkz-community/common-client-lib';

const {devices} = stores;
const {Devices: BaseModel} = classes;

export class Devices extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }
}

export default devices({
  feathersClient,
  extend_instance_defaults: {
    activeKey: undefined,
    keys: [],
    user: undefined,
    users: [],
  },
  state() {
    return {};
  },
  getters: {},
  actions: {},
});
