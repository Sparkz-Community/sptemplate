import feathersClient from '../../api/feathers-client';
import {stores, classes} from '@sparkz-community/common-client-lib';

const {applications} = stores;
const {Applications: BaseModel} = classes;

export class Applications extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }
}

export default applications({
  feathersClient,
  state() {
    return {};
  },
  getters: {},
  actions: {},
});
