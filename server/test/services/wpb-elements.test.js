const assert = require('assert');
const app = require('../../src/app');

describe('\'wpb-elements\' service', () => {
  it('registered the service', () => {
    const service = app.service('wpb-elements');

    assert.ok(service, 'Registered the service');
  });
});
