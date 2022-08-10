const assert = require('assert');
const app = require('../../src/app');

describe('\'wpb-page-publications\' service', () => {
  it('registered the service', () => {
    const service = app.service('wpb-page-publications');

    assert.ok(service, 'Registered the service');
  });
});
