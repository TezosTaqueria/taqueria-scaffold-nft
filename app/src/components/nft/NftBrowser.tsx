import React, { useEffect, useState } from "react";
import { ContractService } from "../../services/contract-service";
import { NftType } from "../../services/types";
import { useAsyncWorker } from "../../utils/hooks";
import { Button } from "../styles/Button.styled";


export const NftBrowser = () => {

    const [nfts, setNfts]  = useState(undefined as undefined | NftType[]);
    const { loading, error, progress, doWork } = useAsyncWorker();

    const loadNfts = () => {
        doWork(async (stopIfUnmounted, updateProgress) => {
            await ContractService.loadContract(updateProgress);

            const resultNfts = await ContractService.getNfts(updateProgress);
            stopIfUnmounted();

            setNfts(resultNfts);

            // const resultContractAddress = await ContractService.getContractAddress();
            // stopIfUnmounted();

            // // setContractAddress(resultContractAddress);

            // // Get balance
            // const balanceResult = await ContractService.getBalance(updateProgress);
            // stopIfUnmounted();
            // setBalance(balanceResult);

            // setIsContractReady(true);
		});
    };
    
    useEffect(() => {
		loadNfts();
    },[]);

    return (
        <>
            <h3>Browse Nfts</h3>
			
            {loading && (
				<div className='loading'>
					loading... {progress.message}{' '}
					{(progress.ratioComplete * 100).toFixed(0)}%
				</div>
			)}
			{error && <div className='error'>{error.message}</div>}

            {!loading && !nfts && (
                <Button onClick={loadNfts}>Load Nfts</Button>
            )}
            <div style={{display:'flex', flexDirection:'row', flexWrap: 'wrap' }}>
                {nfts?.map(x=>(
                    <React.Fragment key={x.tokenId}>
                        <NftItem item={x}/>
                    </React.Fragment>
                ))}
            </div>
        </>
    );
};

const NftItem = ({
    item,
}:{
    item: NftType;
}) => {

    return (
        <div style={{
            display:'flex', flexDirection:'column', alignItems:'center', 
            padding: 4, margin: 4, 
            boxShadow: '2px 2px 4px 2px #FFCCCC',
            width: 240, height: 240 }}>
            <div>
                {item.name}
            </div>
            <div>
                <img alt='nft' style={{ maxWidth:160, maxHeight:160 }} src={item.image.thumbnailUrl ?? item.image.imageUrl}/>
            </div>
            <div>
                {item.description}
            </div>
        </div>
    );
};