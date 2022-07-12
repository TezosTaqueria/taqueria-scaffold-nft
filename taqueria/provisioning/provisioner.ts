import path from "path";
import fs from "fs/promises";
import { getDirectoryFiles, getFileInfo, readJsonFile } from "./helpers";
import { getMediaFileFormat } from "./media-files";
import { provisionerInstance, tasks } from "./mock-provision-tasks-and-state";
import { provisionHasFileChanged, provisionHaveFilesChanged } from "./provisioner-builders";
import { originateContract } from "./taquito-access";
import { finalizeTzip21Metadata, Tzip21Metadata_Initial } from "./tzip-21-metadata";
const { provision } = provisionerInstance;

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

// # Verify the contract metadata is valid
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

            return {
                contractAddress,
            };
        })
        .after([pCompile, pPublishContractMetadata]);


// # Publish new token asset files to ipfs
const pHaveFilesChanged_assets = provisionHaveFilesChanged('./assets/', x => !x.endsWith('.json'));
const pPublishAssetFiles =
    provision("publish asset files")
        .task(state => tasks['ipfs-pinata'].publish({
            fileOrDirectoryPath: './assets/',
        }))
        .after([pHaveFilesChanged_assets])
    ;

// # Finalize token metadata files
const pHaveFilesChanged_metadata = provisionHaveFilesChanged('./assets/', x => x.endsWith('.json'));

const pFinalizeTokenMetadataFiles =
    provision("finalize token metadata files")
        .task(async state => {

            const assetFiles = await getDirectoryFiles('./assets');
            const commonFilePath = path.resolve(process.cwd(), './assets/_common.json');
            const commonJson = await readJsonFile<Record<string, unknown>>(commonFilePath) ?? {};

            const ipfsHashes = (
                await state.getAllProvisionOutput<{
                    filePath: string,
                    ipfsHash: string,
                }[]>(pPublishAssetFiles.name)
            )?.flatMap(x => x.output) ?? [];
            const ipfsHashesMap = new Map(ipfsHashes.map(x => [x.filePath, x.ipfsHash]));

            const finalizeTokenMetadataFile = async (assetFilePath: string) => {
                const ext = path.extname(assetFilePath);
                const baseFileName = assetFilePath.substring(0, assetFilePath.length - ext.length);

                const descriptionFilePath = `${baseFileName}.description.json`;
                const descriptionJson = await readJsonFile<Record<string, unknown>>(descriptionFilePath) ?? {};

                const metadataFilePath = `${baseFileName}.json`;
                const metadataJson = await readJsonFile<Record<string, unknown>>(metadataFilePath) ?? {};

                const thumbFilePath = assetFiles.find(x => x.startsWith(`${baseFileName}.thumb`));

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
            const mainAssetFiles = assetFiles.filter(x => !x.endsWith('.json') && !x.includes('.thumb.'));
            for (const f of mainAssetFiles) {
                await finalizeTokenMetadataFile(f);
            }

            return {
                mainAssetFiles,
            };
        })
        .after([pHaveFilesChanged_metadata, pPublishAssetFiles])
    ;

// // # Verify the image token metadata is valid
// // # Publish image token metadata to ipfs
// const pPublishAssetMetadataFiles =
//     provision("publish metadata files")
//         .task(state => tasks['ipfs-pinata'].publish({
//             fileOrDirectoryPath: './assets/',
//         }))
//         .after([pFinalizeTokenMetadataFiles])
//     ;

// // # Mint nft in contract (set tokenId to image token metadata ipfs hash)
