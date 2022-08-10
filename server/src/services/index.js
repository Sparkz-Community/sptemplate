const batch = require('./batch/batch.service.js');

const commonServerLib = require('@iy4u/common-server-lib');
const extendUsers = require('./extend-users/extend-users.service.js');
const extendLogins = require('./extend-logins/extend-logins.service.js');
const extendAccounts = require('./extend-accounts/extend-accounts.service.js');
const extendNotifications = require('./extend-notifications/extend-notifications.service.js');
const extendDevices = require('./extend-devices/extend-devices.service');

const authManagement = require('@ionrev/ir-auth-management-server');

const extendIrRolesRoles = require('./extend-ir-roles-roles/extend-ir-roles-roles.service.js');
const extendIrRolesAbilities = require('./extend-ir-roles-abilities/extend-ir-roles-abilities.service.js');
const extendIrRolesRules = require('./extend-ir-roles-rules/extend-ir-roles-rules.service.js');

const feathersFingerprints = require('@iy4u/feathers-fingerprint');
const extendFingerprints = require('./extend-fingerprints/extend-fingerprints.service');

const irMessengerServer = require('@ionrev/ir-messenger-server');
const extendInAppMessages = require('./extend-in-app-messages/extend-in-app-messages.service');

// quickbooks
const feathersQuickbooks = require('@iy4u/feathers-quickbooks');
const extendQuickbooksCompanies = require('./extend-quickbooks-companies/extend-quickbooks-companies.service.js');
const extendQuickbooksAuthentication = require('./extend-quickbooks-authentication/extend-quickbooks-authentication.service.js');

const transformations = require('./transformations/transformations.service.js');
const geocode = require('./geocode/geocode.service.js');
const placesAutoComplete = require('./places-auto-complete/places-auto-complete.service.js');
const servicesExpose = require('./services-expose/services-expose.service.js');
const fileUploader = require('./file-uploader/file-uploader.service.js');
const uploads = require('./uploads/uploads.service.js');
const wallets = require('./wallets/wallets.service.js');
const funnelResponses = require('./funnel-responses/funnel-responses.service.js');
const irRequests = require('./ir-requests/ir-requests.service.js');
const payments = require('./payments/payments.service.js');
const commissionTemplates = require('./commission-templates/commission-templates.service.js');
const stores = require('./stores/stores.service.js');
const storeTemplates = require('./store-templates/store-templates.service.js');
const amazonPsApi = require('./amazon-ps-api/amazon-ps-api.service.js');

const boards = require('./boards/boards.service');
const boardTemplates = require('./board-template/board-templates.service.js');
const lists = require('./lists/lists.service');
const cards = require('./cards/cards.service');
const cardEvents = require('./card-events/card-events.service.js');
const pmTransactionLogs = require('./pm-transaction-logs/pm-transaction-logs.service');

const events = require('./events/events.service.js');
const eventTemplates = require('./event-templates/event-templates.service.js');
const participantEvents = require('./participant-events/participant-events.service.js');

const streams = require('./streams/streams.service.js');
const streamGroups = require('./stream-groups/stream-groups.service.js');

const participants = require('./participants/participants.service.js');
const chats = require('./chats/chats.service.js');
const rooms = require('./rooms/rooms.service.js');
const verifyBankAccount = require('./verify-bank-account/verify-bank-account.service.js');
const invoices = require('./invoices/invoices.service.js');
const leads = require('./leads/leads.service.js');
const warehouses = require('./warehouses/warehouses.service.js');
const inventories = require('./inventories/inventories.service.js');
const counts = require('./counts/counts.service.js');
const countInventoryItems = require('./count-inventory-items/count-inventory-items.service.js');
const products = require('./products/products.service.js');
const inventoryItems = require('./inventory-items/inventory-items.service.js');
const priceBooks = require('./price-books/price-books.service.js');

const glAccounts = require('./gl-accounts/gl-accounts.service.js');
const glClasses = require('./gl-classes/gl-classes.service.js');
const glDepartments = require('./gl-departments/gl-departments.service.js');
const glPeriods = require('./gl-periods/gl-periods.service.js');

const dashboardReports = require('./dashboard-reports/dashboard-reports.service.js');
const dashboards = require('./dashboards/dashboards.service.js');

// website-builder services
const wpbSections = require('./wpb-sections/wpb-sections.service.js');
const wpbPages = require('./wpb-pages/wpb-pages.service.js');
const wpbElements = require('./wpb-elements/wpb-elements.service.js');
const wpbManagement = require('./wpb-management/wpb-management.service.js');
const progress = require('./progress/progress.service.js');
const wpbClasses = require('./wpb-classes/wpb-classes.service.js');
const wpbProjects = require('./wpb-projects/wpb-projects.service.js');
const wpbPagePublications = require('./wpb-page-publications/wpb-page-publications.service.js');
const wpbMailerManagement = require('./wpb-mailer-management/wpb-mailer-management.service.js');
const wpbStylesheets = require('./wpb-stylesheets/wpb-stylesheets.service.js');
const wpbJssConversion = require('./wpb-jss-conversion/wpb-jss-conversion.service.js');
const wpbCssRules = require('./wpb-css-rules/wpb-css-rules.service.js');


const listGroups = require('./list-groups/list-groups.service.js');
const referLinks = require('./refer-links/refer-links.service.js');


const forms = require('./forms/forms.service.js');



// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(batch);
  app.configure(transformations);
  app.configure(servicesExpose);

  // Google
  app.configure(geocode);
  app.configure(placesAutoComplete);

  app.configure(fileUploader);
  app.configure(uploads);
  app.configure(wallets);
  app.configure(funnelResponses);
  app.configure(irRequests);
  app.configure(payments);
  app.configure(commissionTemplates);
  app.configure(stores);
  app.configure(storeTemplates);
  app.configure(amazonPsApi);

  app.configure(boards);
  app.configure(boardTemplates);
  app.configure(lists);
  app.configure(cards);
  app.configure(cardEvents);
  app.configure(pmTransactionLogs);

  app.configure(events);
  app.configure(eventTemplates);
  app.configure(participantEvents);

  app.configure(streams);
  app.configure(streamGroups);

  app.configure(leads);
  app.configure(warehouses);
  app.configure(inventories);
  app.configure(counts);
  app.configure(countInventoryItems);
  app.configure(products);
  app.configure(inventoryItems);
  app.configure(priceBooks);
  app.configure(participants);
  app.configure(chats);
  app.configure(rooms);
  app.configure(invoices);
  app.configure(verifyBankAccount);

  app.configure(glAccounts);
  app.configure(glClasses);
  app.configure(glDepartments);
  app.configure(glPeriods);

  app.configure(dashboardReports);
  app.configure(dashboards);

  // website-builder services
  app.configure(wpbSections);
  app.configure(wpbPages);
  app.configure(wpbElements);
  app.configure(wpbManagement);
  app.configure(progress);
  app.configure(wpbClasses);
  app.configure(wpbProjects);
  app.configure(wpbPagePublications);
  app.configure(wpbMailerManagement);
  app.configure(wpbStylesheets);
  app.configure(wpbJssConversion);
  app.configure(wpbCssRules);

  feathersQuickbooks.services.configureServices(app, ['companies']);
  app.configure(extendQuickbooksCompanies);
  app.configure(extendQuickbooksAuthentication);

  authManagement.services.configureServices(app);

  app.configure(extendIrRolesRoles);
  app.configure(extendIrRolesAbilities);
  app.configure(extendIrRolesRules);

  feathersFingerprints.services.configureServices(app,['fingerprints']);
  app.configure(extendFingerprints);

  commonServerLib.services.configureServices(app, ['users', 'logins', 'accounts', 'devices', 'notifications']);
  app.configure(extendUsers);
  app.configure(extendLogins);
  app.configure(extendAccounts);
  app.configure(extendDevices);
  app.configure(extendNotifications);

  irMessengerServer.services.configureServices(app,['in-app-messages']);
  app.configure(extendInAppMessages);
  app.configure(listGroups);
  app.configure(referLinks);
  app.configure(forms);
};
