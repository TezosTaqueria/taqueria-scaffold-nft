import path from "path";
import fs from "fs/promises";
import { getDirectoryFiles, getFileInfo, readJsonFile } from "./helpers";
import { getMediaFileFormat } from "./media-files";
import { provisionerInstance, tasks } from "./mock-provision-tasks-and-state";
import { provisionHasFileChanged, provisionHaveFilesChanged } from "./provisioner-builders";
import { getTezosSettings, loadContract, originateContract } from "./taquito-access";
import { finalizeTzip21Metadata, Tzip21Metadata_Initial } from "./tzip-21-metadata";
import { tas } from "../types/type-aliases";
import { char2Bytes } from "@taquito/utils";
const { provision, getState } = provisionerInstance;

// TODO: How to manage environments?
const networkKind = 'flextesa';

// # Provisining Steps
const pCompile =
    provision("compile contract")
        .task(state => tasks.ligo.compile({
            contract: state["main.mligo"].relpath,
        }))
        .when(state => state["main.mligo"].hasChanged())
    ;

const pTypes =
    provision("generate types")
        .task(state => tasks['contract-types']['generate types']({
        }))
        .after([pCompile])
    ;

// # Publish the contract metadata to ipfs
const pHasFileChanged_contractMetadata = provisionHasFileChanged('./assets/_collection.json');
const pPublishContractMetadata =
    provision("publish contract metadata")
        .task(state => tasks['ipfs-pinata'].publish({
            fileOrDirectoryPath: './assets/_collection.json',
        }))
        .after([pHasFileChanged_contractMetadata])
    ;

// # Originate the contract with the contract metadata ipfs hash
const pOriginate =
    provision("originate with storage")
        .task(async state => {

            const ipfsHash = (
                await state.getLatestProvisionOutput<{
                    filePath: string,
                    ipfsHash: string,
                }[]>(pPublishContractMetadata.name)
            )?.output[0].ipfsHash;

            if (!ipfsHash) {
                throw new Error('ipfsHash is missing');
            }

            const { contractAddress } = await originateContract({
                networkKind,
                collectionMetadataIpfsHashUri: ipfsHash,
            });

            return [{
                contractAddress,
            }];
        })
        .after([pCompile, pPublishContractMetadata]);


// # Publish new token asset files to ipfs
const pHaveFilesChanged_assets = provisionHaveFilesChanged('asset files', './assets/', x => !x.endsWith('.json'));
const pPublishAssetFiles =
    provision("publish asset files")
        .task(state => tasks['ipfs-pinata'].publish({
            fileOrDirectoryPath: './assets/',
        }))
        .after([pHaveFilesChanged_assets])
    ;

// # Finalize token metadata files
const pHaveFilesChanged_metadata = provisionHaveFilesChanged('asset metadata files', './assets/', x => x.endsWith('.json'));

const getMainAssetFiles = async () => {
    const assetFiles = await getDirectoryFiles('./assets');
    const mainAssetFiles = assetFiles
        .map(x => {
            const tokenId = Number(path.basename(x).split('.')[0]);
            const ext = path.extname(x);
            const baseFileName = x.substring(0, x.length - ext.length);
            const descriptionFilePath = `${baseFileName}.description.json`;
            const metadataFilePath = `${baseFileName}.json`;
            const thumbFilePath = assetFiles.find(x => x.startsWith(`${baseFileName}.thumb`));

            return ({
                filePath: x,
                tokenId,
                ext,
                baseFileName,
                descriptionFilePath,
                metadataFilePath,
                thumbFilePath,
            })
        })
        .filter(x => Number.isInteger(x.tokenId) && !x.filePath.endsWith('.json') && !x.filePath.includes('.thumb.'))
        ;

    return {
        assetFiles,
        mainAssetFiles,
    };
};

const getAllIpfsFileHashes = async (state: Awaited<ReturnType<typeof getState>>) => {
    const ipfsHashes = (
        await state.getAllTaskOutput<{
            filePath: string,
            ipfsHash: string,
        }[]>('@taqueria/plugin-ipfs-pinata', 'publish')
    )?.flatMap(x => x.output) ?? [];
    const ipfsHashesMap = new Map(ipfsHashes.map(x => [x.filePath, x.ipfsHash]));
    return {
        ipfsHashes,
        ipfsHashesMap,
    };
};

const pFinalizeTokenMetadataFiles =
    provision("finalize token metadata files")
        .task(async state => {

            const {
                mainAssetFiles,
            } = await getMainAssetFiles();

            const commonFilePath = path.resolve(process.cwd(), './assets/_common.json');
            const commonJson = await readJsonFile<Record<string, unknown>>(commonFilePath) ?? {};

            const { ipfsHashesMap } = await getAllIpfsFileHashes(state);

            const finalizeTokenMetadataFile = async (mainAssetFile: typeof mainAssetFiles[number]) => {

                const {
                    filePath: assetFilePath,
                    ext,
                    baseFileName,
                    descriptionFilePath,
                    metadataFilePath,
                    thumbFilePath,
                } = mainAssetFile;

                const descriptionJson = await readJsonFile<Record<string, unknown>>(descriptionFilePath) ?? {};
                const metadataJson = await readJsonFile<Record<string, unknown>>(metadataFilePath) ?? {};
                const assetIpfsHash = assetFilePath ? ipfsHashesMap.get(assetFilePath) : undefined;
                const thumbIpfsHash = thumbFilePath ? ipfsHashesMap.get(thumbFilePath) : undefined;

                if (!assetIpfsHash) {
                    return;
                }

                const initialTzip21 = {
                    ...metadataJson,
                    ...commonJson,
                    ...descriptionJson,
                } as Tzip21Metadata_Initial;

                const finalJson = finalizeTzip21Metadata({
                    metadata: initialTzip21,
                    images: {
                        full: {
                            ipfsHash: assetIpfsHash,
                            ...await getMediaFileFormat(assetFilePath),
                        },
                        thumbnail: thumbFilePath && thumbIpfsHash ? {
                            ipfsHash: thumbIpfsHash,
                            ...await getMediaFileFormat(thumbFilePath),
                        } : undefined,
                    },
                });

                // Only save if there were changes
                metadataJson.date = finalJson.date;
                if (JSON.stringify(finalJson) === JSON.stringify(metadataJson)) {
                    return;
                }

                await fs.writeFile(metadataFilePath, JSON.stringify(finalJson, null, 2));
            };

            // Update all metadata files
            for (const f of mainAssetFiles) {
                await finalizeTokenMetadataFile(f);
            }

            return [{
                mainAssetFiles,
            }];
        })
        .after([pHaveFilesChanged_metadata, pPublishAssetFiles])
    ;

// # Publish image token metadata to ipfs
const pPublishAssetMetadataFiles =
    provision("publish metadata files")
        .task(state => tasks['ipfs-pinata'].publish({
            fileOrDirectoryPath: './assets/',
        }))
        .after([pFinalizeTokenMetadataFiles])
    ;

// # Mint nft in contract (set tokenId to image token metadata ipfs hash)
const pMintTokens =
    provision("mint tokens")
        .task(async state => {

            const contractAddress = (
                await state.getLatestProvisionOutput<{
                    contractAddress: string,
                }[]>(pOriginate.name)
            )?.output[0].contractAddress;

            if (!contractAddress) {
                throw new Error('contractAddress is missing');
            }

            const oldMintedTokens = (
                await state.getAllProvisionOutput<{
                    contractAddress: string,
                    mintedTokens: {
                        tokenId: number;
                        ipfsHash: string;
                    }[],
                }[]>('mint tokens')
            ).flatMap(x => x.output)
                .filter(x => x.contractAddress === contractAddress)
                .flatMap(x => x.mintedTokens);


            const {
                mainAssetFiles,
            } = await getMainAssetFiles();
            const { ipfsHashesMap } = await getAllIpfsFileHashes(state);

            const tokensToMint = mainAssetFiles.map(x => ({
                tokenId: x.tokenId,
                ipfsHash: ipfsHashesMap.get(x.metadataFilePath)!,
            })).filter(x => x.ipfsHash)
                .filter(x => !oldMintedTokens.some(o => o.tokenId === x.tokenId));

            const contract = await loadContract(networkKind, contractAddress);
            const { userAddress } = await getTezosSettings(networkKind);

            const remaining = [...tokensToMint];
            while (remaining.length) {
                const batch = remaining.splice(0, 50);
                const call = contract.methodsObject.mint(batch.map(x => ({
                    token_id: tas.nat(x.tokenId),
                    ipfs_hash: tas.bytes(char2Bytes(`ipfs://${x.ipfsHash}`)),
                    owner: tas.address(userAddress),
                })));

                const result = await call.send({
                    //fee: 20000,
                    fee: 40000, // FAST!
                    // storageLimit: 300 * batch.length,
                    // gasLimit: 1000 * batch.length,
                });

                await result.confirmation(2);
            }

            return [{
                contractAddress,
                mintedTokens: tokensToMint
            }];
        })
        .after([pOriginate, pPublishAssetMetadataFiles]);