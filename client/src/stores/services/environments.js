import feathersClient from '../../api/feathers-client';
import {stores, classes} from '@sparkz-community/common-client-lib';

const {environments} = stores;
const {Environments: BaseModel} = classes;

export class Environments extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }
}

export default environments({
  feathersClient,
  extend_instance_defaults: {
    routes: [],
  },
  state() {
    return {};
  },
  getters: {},
  actions: {},
});
