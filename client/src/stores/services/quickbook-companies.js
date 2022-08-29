import feathersClient from '../../api/feathers-client';
import {stores, classes} from '@sparkz-community/common-client-lib';

const {quickbookCompanies} = stores;
const {QuickbooksCompanies: BaseModel} = classes;

export class QuickbooksCompanies extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }
}

export default quickbookCompanies({
  feathersClient,
  extend_instance_defaults: {
    accounts: [],
    stores: [],
  },
  state() {
    return {};
  },
  getters: {},
  actions: {},
});
