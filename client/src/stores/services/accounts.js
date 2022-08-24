import feathersClient from '../../api/feathers-client';
import accounts from '@sparkz-community/common-client-lib/src/stores/services/accounts';

export default accounts({
  feathersClient,
  extend_instance_defaults: {
    logins: {
      ownedBy: [],
      members: [],
    },
    ownership: {
      owners: undefined,
      owns: undefined,
    },
    membership: {
      members: undefined,
      membersOf: undefined,
    },
    authOwnerId: undefined,
    authModelName: undefined,
    responsibleForEnvironments: [],
    settings: {
      theme: undefined,
      hosts: undefined,
      instances: undefined,
      applications: undefined,
      domains: undefined,
      environments: undefined,
      accounts: undefined,
    },
    participant: undefined,
    deleted: undefined,
    deletedAt: undefined,
    applications: [],
    environment: undefined,
    createdBy: {
      account: undefined,
      user: undefined,
      login: undefined,
      integration: undefined,
      fingerprint: undefined,
    },
    updatedBy: {
      account: undefined,
      user: undefined,
      login: undefined,
      integration: undefined,
      fingerprint: undefined,
    },
    updatedByHistory: {
      account: undefined,
      user: undefined,
      login: undefined,
      integration: undefined,
      fingerprint: undefined,
      updatedAt: undefined,
    },
    external: {
      createdBySource: {
        id: undefined,
        Model: undefined,
      },
      updatedBySource: {
        id: undefined,
        Model: undefined,
      },
      updatedBySourceHistory: {
        updatedBy: undefined,
        updatedByHistoryModel: undefined,
        updatedAt: undefined,
      },
      meta: undefined,
    },
  },
  state() {
    return {
    
    };
  },
  getters: {
  
  },
  actions: {
  
  },
});
