module.exports = {
    APP_URL: process.env.APP_URL || 'https://9pc9lrygrl.execute-api.us-east-2.amazonaws.com/dev',
    TOKEN: process.env.TELEGRAM_BOT_API_KEY,
    WALLET_ADDRESS: process.env.WALLET_ADDRESS,
    ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
    COINMARKETCAP_API_KEY: process.env.COINMARKETCAP_API_KEY,
    ETHERSCAN_API_BASE: 'https://api.etherscan.io/api',
    THE_GRAPH_API_BASE: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
};