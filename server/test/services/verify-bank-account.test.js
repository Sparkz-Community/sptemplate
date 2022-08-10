const assert = require('assert');
const app = require('../../src/app');

describe('\'verify-bank-account\' service', () => {
  it('registered the service', () => {
    const service = app.service('verify-bank-account');

    assert.ok(service, 'Registered the service');
  });
});
