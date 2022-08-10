const assert = require('assert');
const app = require('../../src/app');

describe('\'fingerprints\' service', () => {
  it('registered the service', () => {
    const service = app.service('fingerprints');

    assert.ok(service, 'Registered the service');
  });
});
