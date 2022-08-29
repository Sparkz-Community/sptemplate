import feathersClient from '../../api/feathers-client';
import {stores, classes} from '@sparkz-community/common-client-lib';

const {wallets} = stores;
const {Wallets: BaseModel} = classes;

export class Wallets extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }
}

export default wallets({
  feathersClient,
  state() {
    return {};
  },
  getters: {},
  actions: {},
});
