import { provisionerInstance, tasks } from "./mock-provision-tasks-and-state";
import { provisionHasFileChanged } from "./provisioner-builders";
const { provision } = provisionerInstance;


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

// const pOriginate =
//     provision("originate")
//         .task(state => tasks.taquito.originate({
//             contract: state["main.mligo"].artifactAbspath
//         }))
//         .after([pCompile]);

// # Verify the contract metadata is valid

// # Publish the contract metadata to ipfs
const pHasFileChanged_contractMetadata = provisionHasFileChanged('../assets/contract-metadata.json');
const pPublishContractMetadata =
    provision("publish contract metadata")
        .task(state => tasks['ipfs-pinata'].publish({
            fileOrDirectoryPath: './assets/contract-metadata.json',
        }))
        .after([pHasFileChanged_contractMetadata])
    ;

// # Originate the contract with the metadata ipfs hash
// const pOriginate =
//     provision("originate with storage")
//         .task(async state => await tasks.taquito.originate({
//             contract: state["main.mligo"].artifactAbspath
//         }))
//         .after([pCompile, pPublishContractMetadata]);

// # Find image files in assets folder
// # Publish new image files to ipfs
// # Set image hashes in image token metadata file
// # Verify the image token metadata is valid
// # Publish image token metadata to ipfs
// # Mint nft in contract (set tokenId to image token metadata ipfs hash)
