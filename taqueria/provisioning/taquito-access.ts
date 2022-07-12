import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import { tas } from '../types/type-aliases';
import { MainContractType } from '../types/main.types';
import { MainCode } from '../types/main.code';
import { char2Bytes } from "@taquito/utils";
import configJson from "../.taq/config.json";

type NetworkKind = 'flextesa' | 'ithacanet'
const getTezosToolkit = async (networkKind: NetworkKind) => {

    const network = networkKind === 'ithacanet' ? {
        rpcUrl: "https://ithacanet.ecadinfra.com/",
        // TODO: Get testnet config
        userAddress: configJson.sandbox.local.accounts.bob.publicKeyHash,
        signer: await InMemorySigner.fromSecretKey(configJson.sandbox.local.accounts.bob.secretKey.replace('unencrypted:', '')),
    } : {
        rpcUrl: "http://localhost:20000/",
        userAddress: configJson.sandbox.local.accounts.bob.publicKeyHash,
        signer: await InMemorySigner.fromSecretKey(configJson.sandbox.local.accounts.bob.secretKey.replace('unencrypted:', '')),
    };

    const Tezos = new TezosToolkit(network.rpcUrl);
    Tezos.setSignerProvider(network.signer);

    return {
        Tezos,
        ...network,
    };
};

export const loadContract = async (networkKind: NetworkKind, address: string) => (await getTezosToolkit(networkKind))
    .Tezos
    .contract.at<MainContractType>(address);

export const originateContract = async ({
    networkKind,
    collectionMetadataIpfsHashUri,
}: {
    networkKind: NetworkKind,
    collectionMetadataIpfsHashUri: string;
}) => {
    const { Tezos, userAddress } = await getTezosToolkit(networkKind);
    const origination = await Tezos
        .contract.originate<MainContractType>({
            code: MainCode.code,
            storage: {
                admin: tas.address(userAddress),
                ledger: tas.bigMap([]),
                metadata: tas.bigMap({
                    '': tas.bytes(char2Bytes(collectionMetadataIpfsHashUri)),
                }),
                operators: tas.bigMap([]),
                token_metadata: tas.bigMap([]),
                total_supply: tas.nat(0),
            },
            //fee: 20000,
            fee: 40000, // FAST!
            storageLimit: 300,
            gasLimit: 1000,
        });

    const contractAddress = (await origination.contract()).address;
    return {
        contractAddress,
    };
}