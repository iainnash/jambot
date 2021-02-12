const fetch = require('node-fetch');
const { COINMARKETCAP_API_KEY } = require('../config');

async function getCoinInfo(coinName) {
    const res = await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?symbol=${coinName}`, {
        headers: {
            'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
        }
    }).then((r) => r.json());
    console.log({ res });
    return res.data;
}

module.exports = { getCoinInfo };