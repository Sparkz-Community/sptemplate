const assert = require('assert');
const app = require('../../src/app');

describe('\'leads\' service', () => {
  it('registered the service', () => {
    const service = app.service('leads');

    assert.ok(service, 'Registered the service');
  });
});
