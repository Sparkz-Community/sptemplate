import feathersClient from '../../api/feathers-client';
import {stores, classes} from '@sparkz-community/common-client-lib';

const {integrationAuths} = stores;
const {IntegrationAuths: BaseModel} = classes;

export class IntegrationAuths extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }
}

export default integrationAuths({
  feathersClient,
  state() {
    return {};
  },
  getters: {},
  actions: {},
});
