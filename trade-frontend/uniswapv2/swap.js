import {
    Percent,
    ETHER,
    ChainId,
    Token,
    WETH,
    Fetcher,
    Trade,
    Route,
    TokenAmount,
    TradeType,
} from "@uniswap/sdk";
import { ethers } from "ethers";
import * as IUniswapV2Router from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";

export const UNISWAP_ROUTER_ADDRESS =
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

ethers;

export async function getProvider() {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const balance = await provider.getBalance("ethers.eth");
    // console.log('has balance', balance.toString());
    return provider;
}

export function getTokenRouterContract(provider) {
    const UniswapRouter = new ethers.Contract(
        UNISWAP_ROUTER_ADDRESS,
        IUniswapV2Router.abi,
        provider.getSigner()
    );
    return UniswapRouter;
}

export async function getTokenFromETH(
    signer,
    token,
    amount = "1000000000000000000"
) {
    const TOKEN = new Token(ChainId.ROPSTEN, ethers.utils.getAddress(token), 18);

    // note that you may want/need to handle this async code differently,
    // for example if top-level await is not an option
    const pair = await Fetcher.fetchPairData(TOKEN, WETH[TOKEN.chainId]);

    const route = new Route([pair], WETH[TOKEN.chainId]);

    const trade = new Trade(
        route,
        new TokenAmount(WETH[TOKEN.chainId], amount),
        TradeType.EXACT_INPUT
    );

    const slippageTolerance = new Percent("50", "10000"); // 50 bips, or 0.50%
    // const amountOutMin = trade.minimumAmountOut(slippageTolerance).hex // needs to be converted to e.g. hex
    // const amountOutMin = "0.1";
    // console.log('amount', amount, 'amountOutMin', amountOutMin);
    console.log("trade", trade);
    const path = [WETH[TOKEN.chainId].address, TOKEN.address];
    const toUnchecked = await signer.getAddress();
    const to = ethers.utils.getAddress(toUnchecked);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
    const value = trade.inputAmount; // // needs to be converted to e.g. hex

    const UniswapRouter = new ethers.Contract(
        UNISWAP_ROUTER_ADDRESS,
        IUniswapV2Router.abi,
        signer
    );

    console.log({
        // amountOutMin,
        path,
        to,
        deadline,
    });

    return UniswapRouter.swapExactETHForTokens(
        "50000000000000000",
        path,
        to,
        deadline, { value: "50000000000000000", gasPrice: 20e9 }
    );
}