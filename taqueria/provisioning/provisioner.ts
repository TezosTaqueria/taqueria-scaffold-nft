import { provisionerInstance, tasks } from "./mock-provision-tasks-and-state";
import { provisionHasFileChanged, provisionHaveFilesChanged } from "./provisioner-builders";
import { originateContract } from "./taquito-access";
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
const pHasFileChanged_contractMetadata = provisionHasFileChanged('./assets/contract-metadata.json');
const pPublishContractMetadata =
    provision("publish contract metadata")
        .task(state => tasks['ipfs-pinata'].publish({
            fileOrDirectoryPath: './assets/contract-metadata.json',
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

// // # Set token asset file hashes in token metadata file
// const pSetAssetFileHashes =
//     provision("set asset ipfs hashes in metadata files")
//         .task(async state => {
//             const ipfsHashesToUpdate = (
//                 await state.getLatestProvisionOutput<{
//                     filePath: string,
//                     ipfsHash: string,
//                 }[]>(pPublishAssetFiles.name)
//             )?.output ?? [];

//             return {};
//         })
//         .after([pPublishAssetFiles])
//     ;

// # Verify the image token metadata is valid
// # Publish image token metadata to ipfs
// const pPublishAssetMetadataFiles =
//     provision("publish asset files")
//         .task(state => tasks['ipfs-pinata'].publish({
//             fileOrDirectoryPath: './assets/',
//         }))
//         .after([pSetAssetFileHashes])
//     ;

// // # Mint nft in contract (set tokenId to image token metadata ipfs hash)
