const assert = require('assert');
const app = require('../../src/app');

describe('\'transformations\' service', () => {
  it('registered the service', () => {
    const service = app.service('transformations');

    assert.ok(service, 'Registered the service');
  });
});
