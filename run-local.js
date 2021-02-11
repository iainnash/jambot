const fs = require('fs');
// TODO: move to shell script
const config_file = fs.readFileSync('./secrets.dev.yml', 'utf8');
config_file.split("\n").map((el) => {
    const [key, value] = el.split(": ")
    process.env[key] = value.replace(/["'\n ]/g, '');
})

// run bot
const app = require('./express-bot-app')
app.listen(1144, () => {
    console.log(`Example app listening at http://localhost:1144`)
})