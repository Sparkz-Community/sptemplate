/* eslint-disable no-console */
const { utils } = require('@iy4u/common-server-lib');
const https = require('https');
const logger = utils.logger;
logger.level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

const app = require('./app');
const port = app.get('port');
const server = app.listen(port);

process.on('unhandledRejection', (reason, p) => {
  logger.error('Unhandled Rejection at: Promise: ' + p + ', reason: ' + reason);
});

server.on('listening', () =>
  logger.info('Feathers application started on http://%s:%d', app.get('host'), port)
);

const callback = function(err, ip){
  if(err){
    return console.log(err);
  }
  logger.info('Public IP is: ' + ip);
};

https.get({
  host: 'api.ipify.org',
}, function(response) {
  let ip = '';
  response.on('data', function(d) {
    ip += d;
  });
  response.on('end', function() {
    if(ip){
      callback(null, ip);
    } else {
      callback('ERROR: could not get public ip address :(');
    }
  });
});
