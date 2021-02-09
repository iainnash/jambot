const TelegramBot = require('node-telegram-bot-api');
const { top100, getCoinsToTrade } = require('./uniswap-data');

const TOKEN = process.env.TELEGRAM_BOT_API_KEY;
const USE_POLLING = process.env.USE_POLLING;

const bot = new TelegramBot(TOKEN, { polling: !!USE_POLLING });

bot.on('message', async(msg) => {
    if (msg.message && msg.message.indexOf('top100') !== -1) {
        await sendTop100(msg);
        return;
    }
    await bot.sendMessage(msg.chat.id, JSON.stringify(msg));
});

async function sendTop100(msg) {
    const res = await top100({ skip: 0 });
    console.log('has response: ')
    console.log(res)
    const resp = res.tokens.map((line) => `$${line.symbol} ${line.name} US$${parseInt(line.tradeVolumeUSD).toLocaleString()}`).join('\n')
    await bot.sendMessage(msg.chat.id, resp);
}

bot.on('inline_query', async(inline_query) => {
    console.log('has inline query', inline_query);
    const coins = await getCoinsToTrade();

    await bot.answerInlineQuery(
        inline_query.id,
        coins.map((line) => ({
            type: 'article',
            id: line.id,
            description: line.description,
            title: line.title,
            input_message_content: { message_text: '$TEST' },
            reply_markup: {
                inline_keyboard: [
                    { text: `Buy $${line.symbol}` },
                    { text: `Sell $${line.symbol}` },
                ],
            },
        }))
    );
});

bot.on('poll', async(msg) => {
    console.log('has poll', msg);
});

module.exports = { bot };