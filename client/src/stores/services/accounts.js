import feathersClient from '../../api/feathers-client';
import {stores, classes} from '@sparkz-community/common-client-lib';

const {accounts} = stores;
const {Accounts: BaseModel} = classes;

export class Accounts extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }
}

export default accounts({
  feathersClient,
  extend_instance_defaults: {
    logins: {
      ownedBy: [],
      members: [],
    },
    authOwnerId: undefined,
    participant: undefined,
    messages: undefined,
    outbox: undefined,
    inbox: undefined,
    countInventoryItems: undefined,
    unseenMessages: undefined,
    unseenTasks: undefined,
    boardTemplates: undefined,
    boards: undefined,
    referLinks: [],
  
    parent: undefined,
    children: undefined,
    wallets: undefined,
    quickbooks: {
      connections: [],
      defaultConnection: undefined,
    },
  },
  state() {
    return {};
  },
  getters: {},
  actions: {},
});
