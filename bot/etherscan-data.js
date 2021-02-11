const fetch = require("node-fetch");
const BigNumber = require("bignumber.js");
const {
    WALLET_ADDRESS,
    ETHERSCAN_API_KEY,
    ETHERSCAN_API_BASE,
} = require("../config");

async function getTokenHoldings() {
    const response = await fetch(
        `${ETHERSCAN_API_BASE}?module=account&action=tokentx&address=${WALLET_ADDRESS}&page=1&offset=0&sort=asc&apikey=${ETHERSCAN_API_KEY}`
    ).then((r) => r.json());
    console.log("has address" + WALLET_ADDRESS);
    console.log(response);
    const holdings = [];
    const tokenData = {};
    const tokenHoldings = {};
    response.result.forEach((trade) => {
        const {
            value,
            to,
            from,
            tokenName,
            blockNumber,
            blockHash,
            tokenSymbol,
            contractAddress,
            tokenDecimal,
        } = trade;
        if (to.toLowerCase() === WALLET_ADDRESS.toLowerCase()) {
            holdings.push(trade);
            if (!tokenHoldings[tokenSymbol]) {
                tokenHoldings[tokenSymbol] = {
                    value: new BigNumber(0),
                    blockHash,
                    blockNumber,
                    tokenName,
                    tokenSymbol,
                    contractAddress,
                };
            }
            const valueNumber = new BigNumber(value).shiftedBy(-1 * tokenDecimal);
            tokenHoldings[tokenSymbol].value = tokenHoldings[tokenSymbol].value.plus(
                valueNumber
            );
            tokenData[contractAddress] = {
                tokenName,
                tokenSymbol,
                tokenDecimal,
            };
        }
        if (from.toLowerCase() === WALLET_ADDRESS.toLowerCase()) {
            // // yolo don't sell
            // const holding = holdings.findIndex((el) => el.contractAddress === contractAddress);
            // if (!holding) {
            //     return;
            // }
            // holding[value] -= value;
        }
    });
    return tokenHoldings;
}

async function getEthHoldings() {
    const walletAmount = await fetch(
        `${ETHERSCAN_API_BASE}?module=account&action=balance&tag=latest&address=${WALLET_ADDRESS}&apikey=${ETHERSCAN_API_KEY}`
    ).then((r) => r.json());
    const walletEth = new BigNumber(walletAmount.result).shiftedBy(-18);
    return walletEth;
}

module.exports = { getEthHoldings, getTokenHoldings };