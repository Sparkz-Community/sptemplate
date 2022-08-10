const assert = require('assert');
const app = require('../../src/app');

describe('\'commission-templates\' service', () => {
  it('registered the service', () => {
    const service = app.service('commission-templates');

    assert.ok(service, 'Registered the service');
  });
});
