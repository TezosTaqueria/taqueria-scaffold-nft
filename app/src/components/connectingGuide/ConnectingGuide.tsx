import React from 'react';
import styled from 'styled-components';
import ConnectingBeaconImage from '../../assets/connecting-first-image.png';
import ConnectingConfirmImage from '../../assets/connecting-second-image.png';
import ArrowLogo from '../../assets/arrow-logo.svg';

import Edges from '../edge/Edges';

const ConnectingGuide = () => {
	return (
		<ConnectingContainer>
			<Edges>
				<ConnectingConten>
					<ConnectingCard>
						<h1>Connecting Your Tezos Wallet to the NFT Projec</h1>
						<p>
							If you already have a Tezos wallet, get started with this NFT
							project by clicking on Connect in the top right hand connect your
							wallet.
							<br />
							<br />
							After clicking on Connect you will be presented with the Beacon UI
							to select your wallet
						</p>
					</ConnectingCard>
				</ConnectingConten>
			</Edges>
			<ConnectingImageCardContainer>
				<Edges>
					<ConnectingImageCard>
						<img alt='TezosLaptop' src={ConnectingBeaconImage} />
						<img className='logo-arrow' alt='TezosLaptop' src={ArrowLogo} />
						<img alt='TezosLaptop' src={ConnectingConfirmImage} />
					</ConnectingImageCard>
				</Edges>
			</ConnectingImageCardContainer>
		</ConnectingContainer>
	);
};

export default ConnectingGuide;

const ConnectingContainer = styled.div`
	width: 100%;
	padding-top: 200px;
	padding-bottom: 100px;
	@media (max-width: ${({ theme }) => theme.breakpoints.medium}) {
		padding-top: 100px;
	}
`;
const ConnectingConten = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	text-align: center;
	P {
		max-width: 620px;
	}
`;

const ConnectingCard = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding-bottom: 60px;
`;
const ConnectingImageCardContainer = styled.div`
	display: flex;
	position: relative;
	justify-content: center;
	&:before {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		transform: translateY(-50%);
		background: ${({ theme }) => theme.colors.secondary};
		height: 208px;
		width: 100%;
		z-index: -1;
	}
`;
const ConnectingImageCard = styled.div`
	display: flex;
	position: relative;
	justify-content: center;
	align-items: center;
	flex-direction: row;
	.logo-arrow {
		width: 56px;
		height: 56px;
		@media (max-width: ${({ theme }) => theme.breakpoints.small}) {
			width: 40px;
			height: 40px;
		}
		@media (max-width: ${({ theme }) => theme.breakpoints.large}) {
			transform: rotate(90deg);
		}
	}
	@media (max-width: ${({ theme }) => theme.breakpoints.large}) {
		flex-direction: column;
	}
	@media (max-width: ${({ theme }) => theme.breakpoints.small}) {
		img {
			max-height: 380px;
		}
	}
`;
