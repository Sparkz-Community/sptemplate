import feathersClient from '../../api/feathers-client';
import {stores, classes} from '@sparkz-community/common-client-lib';

const {glClasses} = stores;
const {GLClasses: BaseModel} = classes;

export class GLClasses extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }
}

export default glClasses({
  feathersClient,
  state() {
    return {};
  },
  getters: {},
  actions: {},
});
