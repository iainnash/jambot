'use strict';
const TelegramBot = require('node-telegram-bot-api');
const serverless = require('serverless-http');
const express = require('express');
const bodyParser = require('body-parser');

const TOKEN = process.env.TELEGRAM_BOT_API_KEY;

console.log('has TOKEN len' + TOKEN.length);


const bot = new TelegramBot(TOKEN);

const app = express()

// parse application/json
app.use(bodyParser.json())

const url = 'https://i69lym8p99.execute-api.us-east-2.amazonaws.com/dev'

// Just to ping!
bot.on('message', async(msg) => {
    await bot.sendMessage(msg.chat.id, 'I am alive!');
});

const bot_url = `bot${TOKEN}`;

app.post(`/${bot_url}`, (req, res) => {
    console.log('has body', req.body);
    bot.processUpdate(req.body)
    res.sendStatus(200);
});

app.get('/', function(req, res) {
    res.send('Hello World!')
})

app.get('/setup', (req, res) => {
    bot.setWebHook(`${url}/${bot_url}`).then((resp) => {
        console.log(resp);
        console.log(`${url}/bot${TOKEN}`)
        res.send('done');
    }).catch((err) => {
        console.log(err);
        res.send('error');
    });
})

app.get('*', function(req, res) {
    res.send('catchall');
});

module.exports.handler = serverless(app);