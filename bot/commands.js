const COMMANDS = {
    // vote on coins
    vote: {
        description: "Start voting on moves (admins only)",
        handler: (bot, msg) => {
            const options = ["Buy $PARIS", "Sell $1INCH", "Buy $SONAR"];
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
    // dm admin link
    execute: {
        description: "Execute trades (admins only)",
        handler: async(bot, msg) => {
            await bot.sendMessage(msg.chat.id, "PLACEHOLDER (execute trades DM admin requesting)");
        },
    },
    portfolio: {
        description: "Get current portfolio",
        handler: async(bot, msg) => {
            await bot.sendMessage(msg.chat.id, "PLACEHOLDER (current portfolio)");
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