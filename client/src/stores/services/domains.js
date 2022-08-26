import feathersClient from '../../api/feathers-client';
import {stores, classes} from '@sparkz-community/common-client-lib';

const {domains} = stores;
const {Domains: BaseModel} = classes;

export class Domains extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }
}

export default domains({
  feathersClient,
  state() {
    return {};
  },
  getters: {},
  actions: {},
});
