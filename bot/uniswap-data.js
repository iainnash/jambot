const graphql = require("graphql.js");

const graph = graphql(
    "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2", { asJSON: true }
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

module.exports = { getCoinsToTrade };