const db = require('../db/tokens');
const { getHoldings } = require('./etherscan-data');

const COMMANDS = {
    // vote on coins
    vote: {
        description: "Start voting on moves (admins only)",
        handler: async(bot, msg) => {
            const voteOptions = await db.getVote();
            const options = voteOptions.map((o) => JSON.stringify(o)).slice(10);
            // const options = ["Buy $PARIS", "Sell $1INCH", "Buy $SONAR"];
            bot.sendPoll(msg.chat.id, "Moves to make", options, {
                multiple: true,
                is_anonymous: false,
            });
        },
    },
    help: {
        description: "List all commands for the bot",
        handler: async(bot, msg) => {
            await bot.sendMessage(msg.chat.id, "Bot commands: \n" + Object.keys(COMMANDS).map((l) => `/${l}`).join(" \n"));
        }
    },
    suggest: {
        description: "Suggest trade (buy/sell) token",
        handler: async(bot, msg, cmds) => {
            console.log('has cmds', cmds, JSON.stringify(cmds.split(' ')));
            if (cmds.split(' ').length < 2) {
                await bot.sendMessage(msg.chat.id, 'Syntax: "/suggest BUY/SELL TOKEN"');
                return
            }
            const [action, token] = cmds.split(' ');
            await db.addTokenVote(token.toLowerCase(), action.toLowerCase());
            await bot.sendMessage(msg.chat.id, `Placed vote to ${action} ${token}`);
        },
    },
    execute: {
        description: "Execute trades (admins only)",
        handler: async(bot, msg) => {
            await bot.sendMessage(msg.chat.id, "PLACEHOLDER (execute trades DM admin requesting)");
        },
    },
    portfolio: {
        description: "Get current portfolio",
        handler: async(bot, msg) => {
            const holdings = await getHoldings();
            const tokenHoldings = await getTokenHoldings()
            const coinDeltas = await getCoinDeltas(tokenHoldings);
            const res = coinDeltas.filter((a) => a.now && a.boughtAt).map((delta) => {
                return `${delta.tokenSymbol} @ ${delta.value.decimalPlaces(4).toString()} %: ${new BigDecimal(delta.now).div(new BigDecimal(delta.boughtAt)).dp(5).toString()}`
            }).join("\n")
            await bot.sendMessage(msg.chat.id, "Portfolio:\n" + res.join("\n"));
        },
    },
    performance: {
        description: "Get portfolio performance",
        handler: async(bot, msg) => {
            await bot.sendMessage(msg.chat.id, "PLACEHOLDER (portfolio performance)");
        },
    },
};

function getCommandsText() {
    const text = Object.keys(COMMANDS).map((commandName) => ({
        command: commandName,
        description: COMMANDS[commandName].description,
    }));
    console.log(text);
    return text;
}

async function handleCommand(msg, bot) {
    msg.entities
        .filter((e) => e.type === "bot_command")
        .map(async(command) => {
            let commandText = msg.text.slice(
                command.offset + 1,
                command.offset + command.length
            );
            const argumentsText = msg.text.slice(command.offset + command.length);
            console.log('text', commandText);
            if (commandText.match(/@[a-zA-Z_]+$/)) {
                commandText = commandText.split('@')[0];
            }
            const runCommand = COMMANDS[commandText];
            if (runCommand) {
                await runCommand.handler(bot, msg, argumentsText);
            } else {
                await bot.sendMessage(msg.chat.id, "Could not find command :(")
            }
        });
}

module.exports = { handleCommand, getCommandsText, COMMANDS };