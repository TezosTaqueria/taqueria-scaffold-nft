import React, { useEffect, useState } from "react";
import { ContractService } from "../../services/contract-service";
import { NftType } from "../../services/types";
import { delay } from "../../utils/delay";
import { useAsyncWorker } from "../../utils/hooks";
import { Button, ButtonSmall } from "../styles/Button.styled";

// @refresh reset
export const NftBrowser = () => {

    const [nfts, setNfts]  = useState(undefined as undefined | NftType[]);
    const [contractAddress, setContractAddress]  = useState(undefined as undefined | string);
    const { loading, error, progress, doWork } = useAsyncWorker();

    const loadNfts = () => {
        doWork(async (stopIfUnmounted, updateProgress) => {
            let attempt = 0;
            while(attempt < 5){
                if(await ContractService.getUserAddress()){
                    break;
                }
                attempt++;
                await delay(100 * Math.pow(2,attempt));
            }

            const { contractAddress } = await ContractService.loadContract(updateProgress);
            stopIfUnmounted();

            setContractAddress(contractAddress);

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
            <div style={{padding: 32}}>
                <h3>Nfts</h3>
                <h5>Contract Address: {contractAddress}</h5>
                
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
            display:'flex', flexDirection:'column', alignItems:'stretch', 
            padding: 4, margin: 4, 
            boxShadow: '2px 2px 2px 2px #FCAF17',
            width: 240, height: 240 }}>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
            }}>
                <div>
                    {item.name}
                </div>
                <div>
                    #{item.tokenId}
                </div>
            </div>
            <div>
                <img alt='nft' style={{ maxWidth:160, maxHeight:160 }} src={item.image.thumbnailUrl ?? item.image.imageUrl}/>
            </div>
            <div>
                {item.description}
            </div>
            <div style={{flex: 1}}/>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
            }}>
                <div style={{flex: 1}}/>
                {/* TODO: Nft Details */}
                <ButtonSmall 
                    onClick={()=>window.location.href = `/nft/${item.tokenId}`}
                >Details</ButtonSmall>
            </div>
        </div>
    );
};