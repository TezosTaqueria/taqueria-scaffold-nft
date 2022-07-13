import React from 'react';
import styled from 'styled-components';
import KeyLogo from '../../assets/key-logo.svg';
import BoxLogo from '../../assets/box-logo.svg';

import Edges from '../edges/Edges';

const About = () => {
	return (
		<AboutContainer>
			<Edges>
				<AboutConten>
					<h1>About This Project</h1>
					<p>
						Getting started with an NFT project can be tricky. There are a
						number of components that come together to create a well-rounded NFT
						project. The Taqueria NFT Scaffold gives you everything necessary to
						see how an NFT project comes together and a foundation to use to
						create your own NFT project on Tezos.
					</p>

					<AboutCard>
						<AboutCardTitle>This project contains:</AboutCardTitle>
						<AboutCardItem>
							<img alt='key-logo' src={KeyLogo} />
							<p>Taqueria NFT project with an NFT smart contract</p>
						</AboutCardItem>
						<AboutCardItem>
							<img alt='box-log' src={BoxLogo} />
							<p>
								React app as a user interface to interact with the smart
								contract for minting and showing NFTs.
							</p>
						</AboutCardItem>
					</AboutCard>
				</AboutConten>
			</Edges>
		</AboutContainer>
	);
};

export default About;

const AboutContainer = styled.div`
	width: 100%;
	padding-top: 50px;
	padding-bottom: 50px;
	position: relative;
	z-index: 0;
`;
const AboutConten = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding-top: 25px;
	padding-bottom: 25px;
	align-items: center;
	text-align: center;
	p {
		max-width: 1000px;
	}
`;

const AboutCard = styled.div`
	border: 1px solid ${({ theme }) => theme.colors.primary};
	width: 100%;
	background-color: ${({ theme }) => theme.colors.bgLight};
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: space-evenly;
	align-items: center;
	max-width: 1200px;
	margin-top: 50px;
	margin-bottom: 20px;
	padding: 15px;
	@media (max-width: ${({ theme }) => theme.breakpoints.large}) {
		flex-direction: column;
		width: auto;
	}
`;
const AboutCardTitle = styled.div`
	font-style: normal;
	font-weight: 700;
	font-size: 14px;
	line-height: 22px;
	@media (max-width: ${({ theme }) => theme.breakpoints.large}) {
		margin-bottom: 15px;
	}
`;
const AboutCardItem = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
	text-align: left;
	p {
		max-width: 360px;
	}
	img {
		width: 25px;
		height: 25px;
	}
`;
