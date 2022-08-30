import feathersClient from '../../api/feathers-client';
import {stores, classes} from '@sparkz-community/common-client-lib';

const {features} = stores;
const {Features: BaseModel} = classes;

export class Features extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }
}

export default features({
  feathersClient,
  extend_instance_defaults: {
    contents: [],
  },
  state() {
    return {};
  },
  getters: {},
  actions: {},
});
