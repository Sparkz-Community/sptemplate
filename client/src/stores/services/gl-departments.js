import feathersClient from '../../api/feathers-client';
import {stores, classes} from '@sparkz-community/common-client-lib';

const {glDepartments} = stores;
const {GLDepartments: BaseModel} = classes;

export class GLDepartments extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }
}

export default glDepartments({
  feathersClient,
  state() {
    return {};
  },
  getters: {},
  actions: {},
});
