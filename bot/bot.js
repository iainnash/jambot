const TelegramBot = require('node-telegram-bot-api');
const { top100, getCoinsToTrade } = require('./uniswap-data');
const { TOKEN } = require('../config');
const { handleCommand } = require('./commands');

const bot = new TelegramBot(TOKEN, {});

bot.on('message', async(msg) => {
    if (msg.entities && msg.entities.some((e) => e.type === "bot_command")) {
        await handleCommand(msg, bot);
        return;
    }
    if (msg.message && msg.message.indexOf('top100') !== -1) {
        await sendTop100(msg);
        return;
    }
    // await bot.sendMessage(msg.chat.id, JSON.stringify(msg));

});

async function sendTop100(msg) {
    const res = await top100({ skip: 0 });
    console.log('has response: ')
    console.log(res);
    const resp = res.tokens.map((line) => `$${line.symbol} ${line.name} US$${parseInt(line.tradeVolumeUSD).toLocaleString()}`).join('\n')
    await bot.sendMessage(msg.chat.id, resp);
}

bot.on('inline_query', async(inline_query) => {
    const coins = await getCoinsToTrade();

    await bot.answerInlineQuery(
        inline_query.id,
        coins.map((line) => ({
            type: 'article',
            id: line.id,
            description: line.description,
            title: line.title,
            input_message_content: { message_text: `/suggest BUY $${line.symbol}` },
            _symbol: line.symbol,
            //reply_markup: { inline_keyboard: [
            //        [
            //            // TODO: automatically determine based off portfolio
            //            { text: `Propose buy $${line.symbol}`, callback_data: `buy:${line.symbol}` },
            //            { text: `Propose sell $${line.symbol}`, callback_data: `buy:${line.symbol}` },
            //        ]
            //    ],
            //},
        })).filter((line) => {
            if (!inline_query.query || !inline_query.query.length) {
                return true;
            }
            console.log(line._symbol)
            return line._symbol.toLowerCase().indexOf(inline_query.query.toLowerCase()) === 0
        }).slice(0, 50)
    );
});

bot.on('poll', async(msg) => {
    console.log('has poll', msg);
});

module.exports = { bot };