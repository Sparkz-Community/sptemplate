// https://gist.github.com/bitflower/aa06462e6d70a9192949e6f601a38948
module.exports = {
  // eslint-disable-next-line no-unused-vars
  up: async (app, mongoose) => {
    // Get service
    const s = app.service('transformations');

    // Read all content atoms that have properties
    const newTransformations = [
      {
        category: 'conditionals',
        functionCode: 'compareSwitch',
        name: 'compareSwitch',
        returnType: 'Mixed',
        args: [
          {
            name: 'value1',
            propertyType: 'Mixed',
            required: true
          },
          {
            name: 'value2',
            propertyType: 'Mixed',
            required: true
          },
          {
            name: 'eqValue',
            propertyType: 'Mixed',
            required: true
          },
          {
            name: 'ltValue',
            propertyType: 'Mixed',
            required: true
          },
          {
            name: 'gtValue',
            propertyType: 'Mixed',
            required: true
          }
        ]
      } // remove for type checking while developing
    ];

    for (const transformation of newTransformations) {
      console.log(`Creating transformation ${transformation.name}`);
      await s.create(transformation);
    }

    return true;
  },

  // eslint-disable-next-line no-unused-vars
  down: async (app, mongoose) => {
    // code
    return true;
  }
};
