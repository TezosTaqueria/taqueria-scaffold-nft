import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from "@taquito/beacon-wallet";
import { MainWalletType } from '../types/main.types';
import { tas } from '../types/type-aliases';
import { UpdateProgressCallback } from '../utils/hooks';
import { NftType } from './types';
import { settings } from './settings';
import { bytes2Char } from '@taquito/utils';
import { TransportStatus } from '@airgap/beacon-wallet';

const createContractService = () => {
    // localhost:4242 - flextesa local network
    // const Tezos = new TezosToolkit(`http://localhost:20000`);

    // // Flextesa
    // const network = {
    //     // Use react dev server proxy
    //     rpcUrl: `/`,
    //     type: NetworkType.CUSTOM,
    // };

    // Testnet
    const network = settings.network;

    const Tezos = new TezosToolkit(network.rpcUrl);

    const state = {
        isConnected: false,
        userAddress: undefined as undefined | string,
        userBalance: undefined as undefined | number,
        contractAddress: undefined as undefined | string,
        contract: undefined as undefined | MainWalletType,
    };

    // state.contractAddress = settings.contractAddress;

    const service = {
        getUserAddress: async () => state.userAddress,
        getUserBalance: async () => state.userBalance,
        getContractAddress: async () => state.contractAddress,
        connectWallet: async (updateProgress: UpdateProgressCallback, options?: { reconnectOnly?: boolean }) => {
            console.log('connectWallet START');

            updateProgress('Requesting Permissions');

            const wallet = new BeaconWallet({
                name: "Example Dapp",
            });

            if (!options?.reconnectOnly) {
                await wallet.requestPermissions({
                    network,
                });
            }

            updateProgress('Obtaining User Info');

            state.userAddress = await wallet.getPKH();
            Tezos.setWalletProvider(wallet);

            state.userBalance = (await Tezos.tz.getBalance(state.userAddress)).toNumber() / 1000000;

            state.isConnected = true;

            console.log('connectWallet DONE');
        },
        loadContract: async (updateProgress: UpdateProgressCallback) => {
            if (!state.isConnected) { throw new Error('Not connected'); }

            updateProgress('Loading Contract');

            const contractAddress = settings.contractAddress;

            state.contractAddress = contractAddress;
            state.contract = await Tezos.wallet.at<MainWalletType>(contractAddress);

            console.log('setup', { state });
        },
        // originateContract: async (updateProgress: UpdateProgressCallback) => {
        //     if (!state.isConnected) { throw new Error('Not connected'); }

        //     // Originate contract
        //     updateProgress('Originating Contract');

        //     const origination = await Tezos.wallet.originate<MainWalletType>({
        //         code: MainCode.code,
        //         storage: tas.int(42),
        //     }).send();

        //     updateProgress('Confirming Contract');
        //     const contractAddress = (await origination.contract()).address;
        //     state.contractAddress = contractAddress;
        //     state.contract = await Tezos.wallet.at<MainWalletType>(contractAddress);
        // },
        // getBalance: async (updateProgress: UpdateProgressCallback): Promise<number> => {
        //     if (!state.contract) { throw new Error('Contract is not setup'); }

        //     updateProgress('Getting Balance');

        //     const storage = await state.contract.storage();
        //     console.log('getBalance storage', { storage });
        //     return tas.number(storage);
        // },
        // increment: async (updateProgress: UpdateProgressCallback, amount: number): Promise<number> => {
        //     if (!state.contract) { throw new Error('Contract is not setup'); }

        //     updateProgress('Sending Transaction');
        //     const sendResult = await state.contract.methodsObject.increment(tas.int(amount)).send();

        //     updateProgress('Confirming Transaction');
        //     await sendResult.confirmation(5);

        //     // Read state after update
        //     return service.getBalance(updateProgress);
        // },
        // decrement: async (updateProgress: UpdateProgressCallback, amount: number): Promise<number> => {
        //     if (!state.contract) { throw new Error('Contract is not setup'); }

        //     updateProgress('Sending Transaction');
        //     const sendResult = await state.contract.methodsObject.decrement(tas.int(amount)).send();

        //     updateProgress('Confirming Transaction');
        //     await sendResult.confirmation(5);

        //     // Read state after update
        //     return service.getBalance(updateProgress);
        // },

        getNfts: async (updateProgress: UpdateProgressCallback): Promise<NftType[]> => {
            if (!state.contract) { throw new Error('Contract is not setup'); }

            updateProgress('Getting Minted Nfts');
            const storage = await state.contract.storage();
            const tokenIds = [...new Array(settings.tokenIdMax - settings.tokenIdMin + 1)].map((_, i) => settings.tokenIdMin + i);

            const getIpfsUrl = (ipfsHashUrl: undefined | string) => {
                if (!ipfsHashUrl) { return undefined; }
                return ipfsHashUrl.replace(`ipfs://`, `https://ecad-test.mypinata.cloud/ipfs/`);
            };

            const getToken = async (tokenId: number) => {
                try {
                    console.log('getToken - START', { tokenId });

                    const tokenMetadata = await storage.token_metadata.get(tas.nat(tokenId));
                    console.log('getToken - Got metadata from contract', { tokenId, tokenMetadata });

                    const ipfsHashUrl = bytes2Char(tokenMetadata.token_info.get(''));
                    console.log('getToken - Got ipfsHashUrl from contract', { tokenId, ipfsHashUrl });


                    const tokenJson = await (await fetch(getIpfsUrl(ipfsHashUrl)!)).json() as {
                        tokenId: number;
                        name: string;
                        description: string;
                        displayUri?: string;
                        thumbnailUri?: string;
                    };
                    console.log('getToken - Got tokenJson from ipfs', { tokenId, tokenJson });

                    const token: NftType = {
                        tokenId,
                        ipfsHashUrl,
                        name: tokenJson.name,
                        description: tokenJson.description,
                        image: {
                            imageUrl: getIpfsUrl(tokenJson.displayUri),
                            thumbnailUrl: getIpfsUrl(tokenJson.thumbnailUri),
                        },
                    };
                    console.log('getToken - DONE', { tokenId, token });

                    return token;
                } catch (err) {
                    console.log(`tokenId ${tokenId}: not found`, { err });
                    return undefined;
                }
            };

            const tokens = (await Promise.all(tokenIds.map(async (tokenId) => {
                return await getToken(tokenId);
            }))).filter(x => x).map(x => x!);

            return tokens;
        },

    };

    return service;
};

export const ContractService = createContractService();