const assert = require('assert');
const app = require('../../src/app');

describe('\'event-templates\' service', () => {
  it('registered the service', () => {
    const service = app.service('event-templates');

    assert.ok(service, 'Registered the service');
  });
});
