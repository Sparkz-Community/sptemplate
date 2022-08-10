const assert = require('assert');
const app = require('../../src/app');

describe('\'counts\' service', () => {
  it('registered the service', () => {
    const service = app.service('counts');

    assert.ok(service, 'Registered the service');
  });
});
