const assert = require('assert');
const app = require('../../src/app');

describe('\'quickbooks\' service', () => {
  it('registered the service', () => {
    const service = app.service('quickbooks');

    assert.ok(service, 'Registered the service');
  });
});
