// https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-21/examples/example-020-digital-collectible.json

type Tzip21Metadata_Description = {
    name: string,
    description: string,
    attributes: {
        name: string;
        value: string | number;
    }[],
};

type Tzip21Metadata_Misc = {
    decimals: 0;
    isBooleanAmount: true;
    language: "en";
    date: string;
}

type Tzip21Metadata_Authorship = {
    /** The primary person, people, or organization(s) responsible for creating the intellectual content of the asset. */
    creators?: string[];
    /** The person, people, or organization(s) that have made substantial creative contributions to the asset. */
    contributors?: string[];
    /** The person, people, or organization(s) primarily responsible for distributing or making the asset available to others in its present form. */
    publishers?: string[];
    /** A broad definition of the type of content of the asset. */
    type: string;
    /** A list of tags that describe the subject or content of the asset. */
    tags: string[];

    externalUri: string;

    // externalUri: "https://ta.co/",
    // type: "Digital Taco",
    // minter: "tz1codeYURj5z49HKX9zmLHms2vJN2qDjrtt",
    // creators: [
    //   "CryptoTacos, Inc."
    // ],
    // tags: [
    //   "CryptoTaco",
    //   "taco",
    //   "collectibles"
    // ],

    royalties?: {
        decimals: 2,
        shares: {
            // "tz123...": 150
            [address: string]: number
        }
    }
};

type Tzip21Metadata_ImageIpfs = {
    artifactUri: string;
    displayUri: string;
    thumbnailUri?: string;
    formats: {
        uri: string,
        // hash is not necessary since it is contained in the ipfsCid Multi-Hash
        // hash: string,
        mimeType?: string,
        dimensions?: {
            /** e.g. '512x512' */
            value: string,
            unit: 'px',
        }
    }[];
}


export type Tzip21Metadata =
    Tzip21Metadata_Misc
    & Tzip21Metadata_Description
    & Tzip21Metadata_ImageIpfs;

export type Tzip21Metadata_Initial = Tzip21Metadata_Description & Partial<Tzip21Metadata>;

export type ImageInfo = {
    ipfsHash: string;
    width?: number;
    height?: number;
    mimeType?: string;
};

const imageInfoToFormat = (imageInfo: ImageInfo): Tzip21Metadata_ImageIpfs['formats'][number] => {
    return {
        uri: `ipfs://${imageInfo.ipfsHash}`,
        // hash: imageInfo.checksumHash,
        mimeType: imageInfo.mimeType,
        dimensions: imageInfo.width && imageInfo.height ? {
            value: `${imageInfo.width}x${imageInfo.height}`,
            unit: "px"
        } : undefined,
    };
};

export const finalizeTzip21Metadata = ({
    metadata,
    images,
    authorship,
}: {
    metadata: Tzip21Metadata_Initial;
    images: {
        full: ImageInfo;
        thumbnail?: ImageInfo;
    };
    authorship?: Tzip21Metadata_Authorship;
}): Tzip21Metadata => {

    const { full, thumbnail } = images;

    return {
        ...authorship,
        ...metadata,

        artifactUri: `ipfs://${full.ipfsHash}`,
        displayUri: `ipfs://${full.ipfsHash}`,
        thumbnailUri: thumbnail ? `ipfs://${thumbnail.ipfsHash}` : undefined,
        formats: [
            imageInfoToFormat(full),
            ...thumbnail ? [imageInfoToFormat(thumbnail)] : [],
        ],

        decimals: 0,
        isBooleanAmount: true,
        language: "en",
        date: new Date().toISOString(),
    };
};
