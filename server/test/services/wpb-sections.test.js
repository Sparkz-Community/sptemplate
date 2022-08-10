const assert = require('assert');
const app = require('../../src/app');

describe('\'wpb-sections\' service', () => {
  it('registered the service', () => {
    const service = app.service('wpb-sections');

    assert.ok(service, 'Registered the service');
  });
});
