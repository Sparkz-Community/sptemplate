const assert = require('assert');
const app = require('../../src/app');

describe('\'stream-groups\' service', () => {
  it('registered the service', () => {
    const service = app.service('stream-groups');

    assert.ok(service, 'Registered the service');
  });
});
