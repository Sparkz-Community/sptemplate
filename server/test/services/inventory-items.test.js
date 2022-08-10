const assert = require('assert');
const app = require('../../src/app');

describe('\'inventory-items\' service', () => {
  it('registered the service', () => {
    const service = app.service('inventory-items');

    assert.ok(service, 'Registered the service');
  });
});
