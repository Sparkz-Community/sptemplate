import feathersClient from '../../api/feathers-client';
import {stores, classes} from '@sparkz-community/common-client-lib';

const {geocode} = stores;
const {Geocode: BaseModel} = classes;

export class Geocode extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }
}

export default geocode({
  feathersClient,
  state() {
    return {};
  },
  getters: {},
  actions: {},
});
