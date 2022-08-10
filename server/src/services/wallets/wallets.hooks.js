const {setField} = require('feathers-authentication-hooks');
const {packages: {lodash: {lget, lset}}} = require('@iy4u/common-utils');


const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});

const createTallyBankAccount = async function (ctx) {
  try {
    const bank_name = lget(ctx.data, ['metadata', 'institution', 'name']);
    const public_token = lget(ctx.data, ['metadata', 'public_token']);
    const business_type = lget(ctx.data, ['formData', 'walletFor']); // p
    const name = lget(ctx.data, ['formData','account', 'name']);
    const email = lget(ctx.data, ['formData','account', 'email']);
    const url = undefined; // this.app.get('clientUrl');
    const business_profile = {
      mcc: 5331,
      url: url || 'https://www.website-builder.com', // hard codded for now
    };
    const employersIDNumber = lget(ctx.data, ['formData', 'employersIDNumber']);
    const socialSecurityNo = lget(ctx.data, ['formData', 'socialSecurityNo']);
    let tax_id = undefined;
    let tax_id_model = undefined;
    if (employersIDNumber) {
      tax_id = employersIDNumber;
      tax_id_model = 'ein';
    }
    if (socialSecurityNo) {
      tax_id = socialSecurityNo;
      tax_id_model = 'ssn';
    }
    const verification = {
      additional_document: {
        type: lget(ctx.data, ['formData', 'idType']),
        back: lget(ctx.data, ['formData', 'idDocumentBack', '0', 'raw']),
        front: lget(ctx.data, ['formData', 'idDocumentFront', '0', 'raw']),
      },
      document: {
        type: lget(ctx.data, ['formData', 'idType']),
        back: lget(ctx.data, ['formData', 'idDocumentBack', '0', 'raw']),
        front: lget(ctx.data, ['formData', 'idDocumentFront', '0', 'raw']),
      },
    };
    const accounts = lget(ctx.data, ['metadata', 'accounts']);
    const account = await ctx.app.service('verify-bank-account').patch(null, {
      bank_name,
      public_token,
      business_type,
      business_profile,
      tax_id,
      tax_id_model,
      verification,
      accounts,
      name,
      email,
    });

    const tally_bank_business_profile = {
      accountId: lget(account, '_id'),
      accountName: lget(account, 'name'),
      accountType: lget(account, 'accountType'),
      accountEmail: lget(account, 'email'),
      accountStatus: lget(account, 'active'),
      accountBusinessType: lget(account, 'business_type'),
      externalBanks: lget(account, 'externalBanks'),
      activeExternalBank: lget(account, 'activeExternalBank'),
    };
    lset(ctx.data, 'tally_bank_business_profile', tally_bank_business_profile);
    lset(ctx.data,'account',lget(ctx.data, ['formData','account', '_id']));
  } catch (err) {
    console.error(err);
  }
  return ctx;
};


module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      setEnvironment,
      createTallyBankAccount,
    ],
    update: [
      setEnvironment,
    ],
    patch: [
      setEnvironment,
    ],
    remove: [],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
