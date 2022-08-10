const assert = require('assert');
const app = require('../../src/app');

describe('\'refer-links\' service', () => {
  it('registered the service', () => {
    const service = app.service('refer-links');

    assert.ok(service, 'Registered the service');
  });
});
