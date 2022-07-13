import React from 'react';
import styled from 'styled-components';
import HeroLogo from '../../assets/Taqueria_icon_hero.svg';
import Edges from '../edge/Edges';
import { Button } from '../styles/Button.styled';

const Hero = () => {
	return (
		<Features>
			<Container>
				<Edges>
					<HeroConten>
						<img alt='taqueria-logo' src={HeroLogo} />
						<h1>Taqueria NFT Scaffold</h1>
						<p>Congratulations on launching your first NFT project on Tezos</p>
						<Button>Quick Start</Button>
					</HeroConten>
				</Edges>
			</Container>
			<LeftPurpleLine className='leftPurpleLine' />
			<RightPurpleLine className='rightPurpleLine' />
		</Features>
	);
};

export default Hero;

const Features = styled.section`
	display: flex;
	align-items: center;
	width: 100%;
	height: 100%;
	position: relative;
	&:before {
		content: '';
		position: absolute;
		bottom: -2.5%;
		left: 0;
		width: 20%;
		height: 5%;
		background-color: ${({ theme }) => theme.colors.primary};
		transform: matrix(1, -0.1, 0, 0.99, 0, 0);
		z-index: 1;
	}
	&:after {
		content: '';
		position: absolute;
		top: 87.5%;
		right: 0;
		width: 20%;
		height: 5%;
		background-color: ${({ theme }) => theme.colors.primary};
		transform: matrix(1, -0.1, 0, 0.99, 0, 0);
		z-index: 1;
	}
`;
const Container = styled.div`
	width: 100%;
	background-color: ${({ theme }) => theme.colors.bgLight};
	-webkit-clip-path: polygon(0 0, 100% 0%, 100% 90%, 0% 100%);
	clip-path: polygon(0 0, 100% 0%, 100% 90%, 0% 100%);
	height: 100%;
	position: relative;
`;
const HeroConten = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding-top: 50px;
	padding-bottom: 100px;
	text-align: center;
	img {
		width: 200px;
		height: 200px;
		margin-bottom: 20px;
	}
	p {
		max-width: 280px;
		padding-bottom: 20px;
	}
`;
const LeftPurpleLine = styled.div`
	position: absolute;
	top: 93.5%;
	left: 12.5%;
	width: 10%;
	height: 5%;
	background-color: rgba(160, 102, 170, 0.8);
	transform: matrix(1, -0.1, 0, 0.99, 0, 0);
	z-index: 2;
`;
const RightPurpleLine = styled.div`
	position: absolute;
	top: 91.5%;
	right: 12.5%;
	width: 10%;
	height: 5%;
	background-color: rgba(160, 102, 170, 0.8);
	transform: matrix(1, -0.1, 0, 0.99, 0, 0);
	z-index: 2;
`;
