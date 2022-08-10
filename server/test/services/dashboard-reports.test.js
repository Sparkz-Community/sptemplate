const assert = require('assert');
const app = require('../../src/app');

describe('\'dashboard-reports\' service', () => {
  it('registered the service', () => {
    const service = app.service('dashboard-reports');

    assert.ok(service, 'Registered the service');
  });
});
