const assert = require('assert');
const app = require('../../src/app');

describe('\'wpb-pages\' service', () => {
  it('registered the service', () => {
    const service = app.service('wpb-pages');

    assert.ok(service, 'Registered the service');
  });
});
