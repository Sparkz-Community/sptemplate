const assert = require('assert');
const app = require('../../src/app');

describe('\'list-groups\' service', () => {
  it('registered the service', () => {
    const service = app.service('list-groups');

    assert.ok(service, 'Registered the service');
  });
});
