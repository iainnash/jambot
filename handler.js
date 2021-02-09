'use strict';
const serverless = require('serverless-http');

const app = require('./express-bot-app');

module.exports.handler = serverless(app);