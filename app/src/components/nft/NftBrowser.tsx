import React, { useEffect, useRef, useState } from "react";
import { ContractService } from "../../services/contract-service";
import { NftType } from "../../services/types";
import { delay } from "../../utils/delay";
import { useHistory } from "../../utils/history";
import { useAsyncWorker } from "../../utils/hooks";
import { Button, ButtonSmall } from "../styles/Button.styled";

// @refresh reset

export const NftBrowser = () => {

    const [nfts, setNfts]  = useState(undefined as undefined | NftType[]);
    const [contractAddress, setContractAddress]  = useState(undefined as undefined | string);
    const { loading, error, progress, doWork } = useAsyncWorker();

    const [activeTokenId, setActiveTokenId] = useState(undefined as undefined | number);
    const { location, history } = useHistory();

    useEffect(() => {
        console.log(`href changed`,{ href: location.href, actualHref: window.location.href });

        const tokenId = Number(location.href.match(/browse\/nft\/([^/]+)$/)?.[1]);
        setActiveTokenId(tokenId);
    }, [location.href]);

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

    const showTokenDetails = (tokenId: number) => {
        // setActiveTokenId(tokenId);
        history.pushState(null, '', `/browse/nft/${tokenId}`);
    };

    const closeTokenDetails = () => {
        // setActiveTokenId(undefined);
        history.pushState(null, '', `/browse`);
    };

    const activeToken = nfts?.find(x => x.tokenId === activeTokenId);

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
                {!activeToken && (
                    <div style={{display:'flex', flexDirection:'row', flexWrap: 'wrap' }}>
                        {nfts?.map(x=>(
                            <React.Fragment key={x.tokenId}>
                                <NftItem item={x} onShowTokenDetails={x => showTokenDetails(x)}/>
                            </React.Fragment>
                        ))}
                    </div>
                )}
                {activeToken && (
                    <NftItem item={activeToken} onCloseTokenDetails={closeTokenDetails}/>
                )}
            </div>
        </>
    );
};

const NftItem = ({
    item,
    onShowTokenDetails,
    onCloseTokenDetails,
}: {
    item: NftType;
    onShowTokenDetails?: (tokenId: number) => void;
    onCloseTokenDetails?: () => void;
}) => {

    const showDetails = !!onCloseTokenDetails;

    return (
        <>
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
                {onShowTokenDetails && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                    }}>
                        <div style={{flex: 1}}/>
                        <ButtonSmall 
                            onClick={() => onShowTokenDetails(item.tokenId)}
                        >Details</ButtonSmall>
                    </div>
                )}
            
            </div>
            {showDetails && (
                <>
                    <div style={{
                        whiteSpace: 'pre',
                        padding: 4, margin: 4, marginTop: 16,
                        boxShadow: '2px 2px 2px 2px #FCAF17',
                    }}>
                        {JSON.stringify(item.metadata, null, 4)}
                    </div>
                </>
            )}
        </>
    );
};
