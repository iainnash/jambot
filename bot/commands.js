const BigNumber = require("bignumber.js");
const db = require("../db/tokens");
const { getTokenHoldings, getEthHoldings } = require("./etherscan-data");
const { getCoinDeltas } = require("./uniswap-data");

const COMMANDS = {
    // vote on coins
    vote: {
        description: "Start voting on moves (admins only)",
        handler: async(bot, msg) => {
            const voteOptions = await db.getVote();
            const options = voteOptions.map((option) => `${option.action} $${option.token}`)
            if (options.length < 2) {
                await bot.sendMessage(msg.chat.id, "There need to be at least 2 proposed actions to start a vote!");
            }
            await bot.sendPoll(msg.chat.id, "Moves to make", options, {
                multiple: true,
                is_anonymous: false,
            });
            await db.clearVote();
        },
    },
    help: {
        description: "List all commands for the bot",
        handler: async(bot, msg) => {
            await bot.sendMessage(
                msg.chat.id,
                "Bot commands: \n" +
                Object.keys(COMMANDS)
                .map((l) => `/${l} (${COMMANDS[l].description})`)
                .join(" \n")
            );
        },
    },
    suggest: {
        description: "Suggest trade (buy/sell) token",
        handler: async(bot, msg, cmds) => {
            console.log("has cmds", cmds, JSON.stringify(cmds.split(" ")));
            if (cmds.split(" ").length < 3) {
                await bot.sendMessage(msg.chat.id, 'Syntax: "/suggest BUY/SELL TOKEN"');
                return;
            }
            const [_, action, token] = cmds.split(" ");
            await db.addTokenVote(token.replace(/\$/, '').toLowerCase(), action.toLowerCase());
            await bot.sendMessage(msg.chat.id, `Placed vote to ${action} $${token}`);
        },
    },
    execute: {
        description: "Execute trades (admins only)",
        handler: async(bot, msg) => {
            await bot.sendMessage(
                msg.chat.id,
                "PLACEHOLDER (execute trades DM admin requesting)"
            );
        },
    },
    performance: {
        description: "Get portfolio performance",
        handler: async(bot, msg) => {
            try {
                const holdings = await getEthHoldings();
                const tokenHoldings = await getTokenHoldings();
                const coinDeltas = await getCoinDeltas(tokenHoldings);
                coinDeltas["ETH"] = { tokenSymbol: "ETH", value: holdings };
                const res = Object.values(coinDeltas)
                    .filter(
                        (a) => a.now && a.boughtAt
                    )
                    .filter((a) => a.tokenSymbol != 'cDAI' && a.tokenSymbol != 'UNI' && a.tokenSymbol !== 'AST' && a.tokenSymbol !== 'KNC')
                    .map((delta) => {
                        return `${delta.tokenSymbol} @ ${delta.value
              .decimalPlaces(4)
              .toString()} ${new BigNumber(delta.now)
              .div(new BigNumber(delta.boughtAt))
              .dp(5)
              .toString()}%`;
                    });
                await bot.sendMessage(msg.chat.id, "Portfolio:\n" + res.join("\n"));
            } catch (e) {
                console.error(e);
                await bot.sendMessage(msg.chat.id, "Something broke :(");
            }
        },
    },
    portfolio: {
        description: "Get current token holdings",
        handler: async(bot, msg) => {
            const holdings = await getEthHoldings();
            const tokenHoldings = await getTokenHoldings();
            const lines = [
                `ETH Held: ${holdings.decimalPlaces(6).toString()}`,
                ...Object.values(tokenHoldings).map((value) =>
                    `${value.tokenSymbol} (${value.tokenName}): ${value.value.decimalPlaces(4).toString()}`
                )
            ].join("\n")
            await bot.sendMessage(msg.chat.id, lines);
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
            console.log("text", commandText);
            if (commandText.match(/@[a-zA-Z_]+$/)) {
                commandText = commandText.split("@")[0];
            }
            const runCommand = COMMANDS[commandText];
            if (!runCommand) {
                await bot.sendMessage(msg.chat.id, "Could not find command :(");
                return;
            }
            try {
                await runCommand.handler(bot, msg, argumentsText);
            } catch (e) {
                console.log('has fatal error', e)
                await bot.sendMessage(msg.chat.id, "Error running " + commandText);
            }
        });
}

module.exports = { handleCommand, getCommandsText, COMMANDS };