import feathersClient from '../../api/feathers-client';
import {stores, classes} from '@sparkz-community/common-client-lib';

const {instances} = stores;
const {Instances: BaseModel} = classes;

export class Instances extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }
}

export default instances({
  feathersClient,
  state() {
    return {};
  },
  getters: {},
  actions: {},
});
