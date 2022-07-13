import React from 'react';
import styled from 'styled-components';
import HeroLogo from '../../assets/Taqueria_icon_hero.svg';
import Edges from '../edge/Edges';
import { Button } from '../styles/Button.styled';

const Hero = () => {
	return (
		<HeroContainer>
			<HeroContentContainer>
				<Edges>
					<HeroConten>
						<img alt='taqueria-logo' src={HeroLogo} />
						<h1>Taqueria NFT Scaffold</h1>
						<p>Congratulations on launching your first NFT project on Tezos</p>
						<Button>Quick Start</Button>
					</HeroConten>
				</Edges>
			</HeroContentContainer>
			<div className='leftPurpleLine' />
			<div className='rightPurpleLine' />
		</HeroContainer>
	);
};

export default Hero;

const HeroContainer = styled.div`
	width: 100%;
	z-index: -1;
	&:before {
		content: '';
		position: absolute;
		bottom: -5%;
		left: 0;
		width: 20%;
		height: 5%;
		background-color: ${({ theme }) => theme.colors.primary};
		transform: matrix(1, -0.1, 0, 0.99, 0, 0);
		z-index: 2;
		@media (max-width: 500px) {
			display: none;
		}
	}
	&:after {
		content: '';
		position: absolute;
		bottom: 5%;
		right: 0;
		width: 20%;
		height: 5%;
		background-color: ${({ theme }) => theme.colors.primary};
		transform: matrix(1, -0.1, 0, 0.99, 0, 0);
		z-index: 2;
		@media (max-width: 500px) {
			display: none;
		}
	}
	.leftPurpleLine {
		position: absolute;
		bottom: -1.5%;
		left: 12.5%;
		width: 10%;
		height: 5%;
		background-color: rgba(160, 102, 170, 0.8);
		transform: matrix(1, -0.1, 0, 0.99, 0, 0);
		z-index: 3;
		@media (max-width: 500px) {
			display: none;
		}
	}
	.rightPurpleLine {
		position: absolute;
		bottom: 1.5%;
		right: 12.5%;
		width: 10%;
		height: 5%;
		background-color: rgba(160, 102, 170, 0.8);
		transform: matrix(1, -0.1, 0, 0.99, 0, 0);
		z-index: 3;
		@media (max-width: 500px) {
			display: none;
		}
	}
`;
const HeroContentContainer = styled.div`
	width: 100%;
	padding-top: 20px;
	padding-bottom: 20px;
	background-color: ${({ theme }) => theme.colors.bgLight};
	-webkit-clip-path: polygon(0 0, 100% 0%, 100% 90%, 0% 100%);
	clip-path: polygon(0 0, 100% 0%, 100% 90%, 0% 100%);
`;
const HeroConten = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding-top: 100px;
	padding-bottom: 100px;
	text-align: center;
	img {
		width: 200px;
		height: 200px;
	}

	p {
		max-width: 280px;
		padding-bottom: 20px;
	}
`;
