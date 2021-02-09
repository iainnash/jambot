const fs = require('fs');
// TODO: move to shell script
const config_file = fs.readFileSync('./secrets.dev.yml', 'utf8');
const token = config_file.split(': ')[1].replace(/[\n ]/g, '');
process.env.TELEGRAM_BOT_API_KEY = token;

// run bot
const app = require('./express-bot-app')
app.listen(1144, () => {
    console.log(`Example app listening at http://localhost:1144`)
})