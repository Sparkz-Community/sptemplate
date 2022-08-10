const assert = require('assert');
const app = require('../../src/app');

describe('\'wpb-stylesheets\' service', () => {
  it('registered the service', () => {
    const service = app.service('wpb-stylesheets');

    assert.ok(service, 'Registered the service');
  });
});
