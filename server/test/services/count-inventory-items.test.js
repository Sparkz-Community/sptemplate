const assert = require('assert');
const app = require('../../src/app');

describe('\'count-inventory-items\' service', () => {
  it('registered the service', () => {
    const service = app.service('count-inventory-items');

    assert.ok(service, 'Registered the service');
  });
});
