const Bluebird = require('bluebird');
Bluebird.config({longStackTraces: true, warnings: true});
global.Promise = Bluebird;

const app = require('./app');
const program = require('commander');
const Umzug = require('umzug');
const MongoDBStorage = require('umzug/lib/storages/MongoDBStorage');
const path = require('path');
const {inspect} = require('util');


class MyMongoDBStorage extends MongoDBStorage.default {
  constructor({
    connection,
    collectionName,
    collection,
  }) {
    super({
      connection,
      collectionName,
      collection,
    });
  }

  logMigration(migrationName) {
    return this.collection.insertOne({
      migrationName,
      createdAt: new Date()
    });
  }

  // unlogMigration(migrationName) {
  //   return this.collection.removeOne({
  //     migrationName,
  //   });
  // }
  //
  // executed() {
  //   return this.collection.find({}).sort({
  //     migrationName: 1,
  //   }).toArray().then(records => records.map(r => r.migrationName));
  // }

}


// const leakedHandles = require('leaked-handles');

// leakedHandles.set({
//   fullStack: true, // use full stack traces
//   timeout: 30000, // run every 30 seconds instead of 5.
//   debugSockets: true // pretty print tcp thrown exceptions.
// });

function getMigrationName(migration) {
  return path.basename(migration.path, '.js');
}

async function getStatus(umzug) {
  const executed = (await umzug.executed()).map(getMigrationName);
  const pending = (await umzug.pending()).map(getMigrationName);
  // const current = executed.length > 0 ? executed[0] : '<NO_MIGRATIONS>';
  const current = executed.length > 0 ? executed[executed.length - 1] : '<NO_MIGRATIONS>';
  return {current, executed, pending};
}

async function init() {
  // const app = App();

  const mongoose = app.get('mongooseClient');

  await waitConnected(mongoose.connection);

  const umzug = createUmzug(app, mongoose);

  return {app, mongoose, umzug};
}

function createUmzug(app, mongoose) {
  const umzug = new Umzug({
    migrations: {
      // indicates the folder containing the migration .js files
      path: path.join(__dirname, './migrations'),
      params: [app, mongoose],
      pattern: /\.js$/,
    },
    storage: new MyMongoDBStorage({
      connection: mongoose.connection,
      collectionName: '_migrations',
    }),
    // storage: 'mongodb',
    // storageOptions: {
    //   connection: mongoose.connection,
    //   collectionName: '_migrations',
    // },
    logging(...args) {
      console.log(...args);
    },
  });

  function logUmzugEvent(eventName) {
    // eslint-disable-next-line no-unused-vars
    return function (name, migration) {
      console.dir({
        name,
        eventName,
        migration,
      });
    };
  }

  umzug.on('migrating', logUmzugEvent('migrating'));
  umzug.on('migrated', logUmzugEvent('migrated'));
  umzug.on('reverting', logUmzugEvent('reverting'));
  umzug.on('reverted', logUmzugEvent('reverted'));
  return umzug;
}

function handleError(reason, p) {
  // tslint:disable-next-line:no-console
  console.error(
    'Unhandled Rejection at:',
    p,
    'reason:',
    inspect(reason, {showHidden: false, depth: 6}),
  );
  process.exit(1);
}

function waitConnected(connection) {
  return new Promise((resolve, reject) => {
    setTimeout(
      () =>
        reject(
          new Error('Mongo connection took too long, please check for errors.'),
        ),
      5000,
    );
    connection.on('connected', () => resolve());
  });
}

const errorEvents = [
  'unhandledRejection',
  'uncaughtException',
  'SIGINT',
];
errorEvents.map(eventName => process.on(eventName, handleError));

program
  .command('up')
  .description('Migrate the database to the last version.')
  .action(async () => {
    const {mongoose, umzug} = await init();

    const appliedMigrations = await umzug.up();
    if (appliedMigrations.length === 0) {
      console.log('No migrations were applied.');
    }

    await mongoose.disconnect();
    process.exit(0);
  });

try {
  program
    .command('reset')
    .description('Reverts the database to the initial state')
    .action(async () => {
      const {umzug, mongoose} = await init();

      await umzug.down({to: 0});
      await mongoose.disconnect();
      process.exit(0);
    });
} catch (e) {
  console.error(e);
  process.exit(1);
}

program
  .command('status')
  .description('Shows which migrations were applied and which not')
  .action(async () => {
    const {umzug, mongoose} = await init();

    const status = await getStatus(umzug);
    console.log(JSON.stringify(status, null, 2));
    await mongoose.disconnect();
    process.exit(0);
  });

program
  .command('prev')
  .description('Goes back to the previous version of the database')
  .action(async () => {
    const {umzug, mongoose} = await init();
    const executed = await umzug.executed();

    if (executed.length === 0) {
      throw new Error('Already at initial state');
    }
    const prev = getMigrationName(executed[executed.length - 1]);
    console.log('prev >>>', prev);
    await umzug.down({to: prev});
    await mongoose.disconnect();
    process.exit(0);
  });

// error on unknown commands
program.on('command:*', function () {
  console.error(
    'Invalid command: %s\nSee --help for a list of available commands.',
    program.args.join(' '),
  );
  process.exit(1);
});

program.parse(process.argv);

if (program.args.length === 0) {
  program.help();
}
