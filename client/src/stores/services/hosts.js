import feathersClient from '../../api/feathers-client';
import {stores, classes} from '@sparkz-community/common-client-lib';

const {hosts} = stores;
const {Hosts: BaseModel} = classes;

export class Hosts extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }
}

export default hosts({
  feathersClient,
  state() {
    return {};
  },
  getters: {},
  actions: {},
});
