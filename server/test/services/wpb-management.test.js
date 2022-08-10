const assert = require('assert');
const app = require('../../src/app');

describe('\'wpb-management\' service', () => {
  it('registered the service', () => {
    const service = app.service('wpb-management');

    assert.ok(service, 'Registered the service');
  });
});
