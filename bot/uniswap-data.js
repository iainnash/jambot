const graphql = require("graphql.js");

const graph = graphql(
    "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2", { asJSON: true, debug: true }
);

const top100 = graph(`query tokens($skip: Int!) {
tokens(first: 100, skip: $skip, orderBy:tradeVolumeUSD, orderDirection:desc) {
    id
    name
    derivedETH
    symbol
    tradeVolumeUSD
    __typename
  }
}
`);

async function getCoinDeltas(coins) {
    const queries = Object.values(coins).map(({ blockNumber, contractAddress, tokenSymbol }) => ({
        blockNumber,
        contractAddress,
        tokenSymbol
    }));
    queries.map((query) => {
        graph(`query {
            latest:token(id: "${query.contractAddress}", block: {number: ${query.blockNumber}}) {
                derivedETH
            }
        }`).merge('historicalquery');
    });
    queries.map((query) => {
        graph(`{
            history:token(id: "${query.contractAddress}", block: {number: 11836677}) {
                derivedETH
            }
        }`).merge('historicalquery', { contractAddress: query.contractAddress })
    });
    const response = await graph.commit('historicalquery');
    Object.keys(coins).forEach((coin, index) => {
        coins[coin].boughtAt = response.history[index] && response.history[index].derivedETH;
        coins[coin].now = response.latest[index] && response.latest[index].derivedETH;
    })
    console.log('has coins', coins)
    return coins;
}

async function getCoinsToTrade() {
    const res = await top100({ skip: 0 });
    const resp = res.tokens.map((line) => ({
        ...line,
        description: `E${line.derivedETH} US$${parseInt(
      line.tradeVolumeUSD
    ).toLocaleString()}`,
        title: `$${line.symbol} ${line.name}`,
        name: `$${line.symbol} ${line.name} E${line.derivedETH} US$${parseInt(
      line.tradeVolumeUSD
    ).toLocaleString()}`,
    }));
    return resp;
}

module.exports = { getCoinsToTrade, getCoinDeltas };