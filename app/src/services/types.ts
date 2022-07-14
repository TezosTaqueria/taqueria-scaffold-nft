export type NftType = {
    tokenId: number;
    ipfsHashUrl: string;
    name: string;
    description: string;
    image: {
        imageUrl?: string;
        thumbnailUrl?: string;
    };
};
