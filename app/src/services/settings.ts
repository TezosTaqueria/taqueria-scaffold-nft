import { NetworkType } from "@airgap/beacon-sdk";

export const settings = {
    // network: {
    //     type: NetworkType.GHOSTNET,
    //     rpcUrl: "https://rpc.ghostnet.teztnets.xyz"
    // },
    network: {
        type: NetworkType.CUSTOM,
        rpcUrl: "/"
    },
    contractAddress: 'KT19NrxxDP58Et2oWTBkW3S7h7FwrA1x7g26',
    tokenIdMin: 1,
    tokenIdMax: 2,
};