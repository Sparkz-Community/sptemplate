const assert = require('assert');
const app = require('../../src/app');

describe('\'price-books\' service', () => {
  it('registered the service', () => {
    const service = app.service('price-books');

    assert.ok(service, 'Registered the service');
  });
});
