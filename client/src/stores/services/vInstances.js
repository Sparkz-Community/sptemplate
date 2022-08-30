import feathersClient from '../../api/feathers-client';
import {stores, classes} from '@sparkz-community/common-client-lib';

const {vInstances} = stores;
const {VInstances: BaseModel} = classes;

export class VInstances extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }
}

export default vInstances({
  feathersClient,
  state() {
    return {};
  },
  getters: {},
  actions: {},
});
