const fs = require('fs');
// TODO: move to shell script
process.env.USE_POLLING = 'true';
const config_file = fs.readFileSync('./secrets.dev.yml', 'utf8');
const token = config_file.split(': ')[1].replace(/[\n ]/g, '');
process.env.TELEGRAM_BOT_API_KEY = token;

// run bot
const bot = require('./bot/bot')