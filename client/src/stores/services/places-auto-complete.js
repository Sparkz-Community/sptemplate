import feathersClient from '../../api/feathers-client';
import {stores, classes} from '@sparkz-community/common-client-lib';

const {placesAutoComplete} = stores;
const {PlacesAutoComplete: BaseModel} = classes;

export class PlacesAutoComplete extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }
}

export default placesAutoComplete({
  feathersClient,
  state() {
    return {};
  },
  getters: {},
  actions: {},
});
