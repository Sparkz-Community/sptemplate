const assert = require('assert');
const app = require('../../src/app');

describe('\'my-ip\' service', () => {
  it('registered the service', () => {
    const service = app.service('my-ip');

    assert.ok(service, 'Registered the service');
  });
});
