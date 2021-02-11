const express = require("express");
const bodyParser = require("body-parser");
const { getEthHoldings, getTokenHoldings } = require('./bot/etherscan-data');
const { getCoinDeltas } = require('./bot/uniswap-data');

const { bot } = require("./bot/bot");
const { getCommandsText } = require('./bot/commands');
const { APP_URL, TOKEN } = require("./config");

const app = express();

// parse application/json
app.use(bodyParser.json());

const bot_url = `bot${TOKEN}`;

app.post(`/${bot_url}`, (req, res) => {
    console.log("has body", req.body);
    bot.processUpdate(req.body);
    // this sets a request timeout for the bot; to handle responses
    // todo: update with actual timing from bot
    setTimeout(() => res.sendStatus(200), 600);
});

app.get("/", function(req, res) {
    res.send("Hello World!");
});

app.get("/balances", async function(req, res) {
    // res.send({ eth: await getEthHoldings(), token: await getTokenHoldings() });
    try {
        const tokenHoldings = await getTokenHoldings()
        const coinDeltas = await getCoinDeltas(tokenHoldings);
        res.send({ coinDeltas });
    } catch (e) {
        console.error(e);
        res.send({ error: true })
    }
})

app.get("/setup", (req, res) => {
    bot
        .setWebHook(`${APP_URL}/${bot_url}`)
        .then((resp) => {
            bot.setMyCommands(getCommandsText()).then(() => {
                res.send(`set webhook with app url base: ${APP_URL}`);
            })
        })
        .catch((err) => {
            console.log(err);
            res.send("error");
        });
});

module.exports = app;