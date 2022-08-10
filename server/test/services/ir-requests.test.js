const assert = require('assert');
const app = require('../../src/app');

describe('\'ir-requests\' service', () => {
  it('registered the service', () => {
    const service = app.service('ir-requests');

    assert.ok(service, 'Registered the service');
  });
});
