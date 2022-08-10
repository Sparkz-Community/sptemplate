const assert = require('assert');
const app = require('../../src/app');

describe('\'ir-wpb-templates\' service', () => {
  it('registered the service', () => {
    const service = app.service('ir-wpb-templates');

    assert.ok(service, 'Registered the service');
  });
});
