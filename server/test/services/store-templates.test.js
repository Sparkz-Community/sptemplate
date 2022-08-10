const assert = require('assert');
const app = require('../../src/app');

describe('\'store-templates\' service', () => {
  it('registered the service', () => {
    const service = app.service('store-templates');

    assert.ok(service, 'Registered the service');
  });
});
