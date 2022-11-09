| Scaffold Details   |                                                         |
|--------------------|---------------------------------------------------------|
| Complexity         | Advanced                                                |
| Automated Tests    | No                                                      |
| Installed Plugins  | LIGO, Taquito, Flextesa, Contract Types, IPFS-Pinata    |
| Frontend Dapp      | Yes                                                     |
| Wallet Integration | Yes                                                     |
| Repository         | https://github.com/ecadlabs/taqueria-scaffold-nft       |

:warning: The NFT-Scaffold project is currently in alpha. It is not ready for production use and will be undergoing frequent updates as we work to implement Taqueria State and other features that have not yet been released

## Quickstart

In a rush? You can follow the steps below to get up and running immediately:

### Scaffold and Initialize the Project

1. `taq scaffold https://github.com/ecadlabs/taqueria-scaffold-nft nft-scaffold`
2. `cd nft-scaffold`
3. `npm run setup`
4. `cd taqueria`
5. `touch .env`
6. Get your Pinata JWT token from your [Pinata account](https://app.pinata.cloud/signin)
> Please note that the JWT key is only displayed once when you add a new key. If you have saved a JWS access token, you can use that, but if not, you will have to add a new key and copy the JWT from that. 
7. Insert the JWT from Pinata into the .env file `echo "pinataJwtToken=eyJhbGc..." >> .env`
8. `cd ..`
9. `npm run start:taqueria:local`
10. `npm run apply`
11. `npm run start:app`

## Overview

The NFT scaffold provides a minimal contract and React dApp for publishing and viewing unique NFTs. 
This would be a good beginning point for an artist who wants to sell unique artpieces on their own website. 

## Requirements

- Taqueria v0.22.2 or later
- Docker v20.10.12 or later
- Node.js v16.17.1 or later
- Temple Wallet (can be found [here](https://templewallet.com/))
- A funded testnet account (instructions [here](https://taqueria.io/docs/config/networks/#faucets))

## Using the Project

### Adding Artwork Assets

To add artwork and minting its token:

1. Add the artwork asset file (image, video, etc) to the assets directory
    - `/taqueria/assets`
    - Make sure to name the asset file with the next token id: 
    - i.e. `0042.jpg`
1. Add a thumbnail image for the NFT to the same assets directory
    - use the filename with the same token id with `.thumb`
    - the thumbnail image does not need to be the same file type as the main asset
    - i.e. `0042.thumb.png`
1. Publish the artwork asset to IPFS and mint the NFT to the contract by running the provisioner
    - `npm run apply`
1. Run the dApp and the new NFT should now be visible in the NFT List


## Project Overview

### Scaffold the Project

This project is available as a Taqueria scaffold. To create a new project from this scaffold, run the following command:

```shell
taq scaffold https://github.com/ecadlabs/taqueria-scaffold-nft nft-scaffold
```

This will clone the NFT scaffold project into a directory called `nft-scaffold`

### Project Setup 

1. Change into the `/taqueria` directory inside the newly created project directory:

```shell
cd nft-scaffold/taqueria
```

1. Create the file `.env` inside the `/taqueria` directory

```shell
touch .env
```

4. Get your Pinata JWT token from your [Pinata account](https://app.pinata.cloud/signin)

5. Add the token to the `.env` file you created:

```shell
echo "pinataJwtToken=eyJhbGc..." >> .env
```

6. Go up a directory to start the local Taqueria project

```shell
cd ..
```

7. Start the Taqueria project by running the start script:

```shell
npm run start:taqueria:local
```

:warning: Taqueria's provisioning system is a work-in-progress. However, the provisioning system prototype will closely resemble the version that will be shipped with Taqueria later this year

7. Apply the Provisions

```shell
npm run apply
```

8. Start the dApp:

```shell
npm run start:app
```

Use the dApp (served in your browser at [http://localhost:3000](http://localhost:3000)) by connecting a wallet and using the web UI

## Project Structure

- `app`
    
    - Minimal create React app
    - Call contract methods
    - Access contract storage

- `taqueria`

    - Everything related to the contract
    - `taqueria/.taq`
        - Taqueria config folder, including setup for all required plugins
    - `taqueria/contracts`
        - The contract .ligo code
    - `taqueria/artifacts`
        - The compiled contract (*.tz file)
    - `taqueria/types`
        - The contract typescript typing
    - `taqueria/assets`
        - The NFT assets to upload

### React Dapp

The React dApp allows browsing the NFTs that have been minted to the contract. 
This is a minimal React project and needs to be extended to support marketplace features like selling or browsing owned NFTs.

### Build and Start the React Dapp

Change into the `/app` directory:

```shell
cd app
```

Build the React dApp:

```shell
npm run build
```

Start and serve the dApp:

```shell 
npm run start
```

You should now be able to access the NFT scaffold dApp at [http://localhost:3000](http://localhost:3000/)

### Connect to Temple Wallet

Open a browser and navigate to [http://localhost:3000](http://localhost:3000/)

Click on the `Connect wallet` button in the top right corner of the page and select `Temple Wallet`

Provide your credentials for the wallet, select a funded account, and click `connect`