const assert = require('assert');
const app = require('../../src/app');

describe('\'wpb-jss-conversion\' service', () => {
  it('registered the service', () => {
    const service = app.service('wpb-jss-conversion');

    assert.ok(service, 'Registered the service');
  });
});
