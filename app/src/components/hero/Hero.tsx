import React from 'react';
import styled from 'styled-components';
import { AppAdmin } from '../../app-admin';
import Logo from '../../assets/ecad-logo.svg';
import Edges from '../edges/Edges';
import { Button } from '../styles/Button.styled';

const Hero = () => {
	return (
		<HeroContainer>
			<Edges>
				<HeroConten>
					<TextCard>
						<h1>NFT Scaffold is awesome.</h1>
						<p>
							Et has minim elitr intellegat. Mea aeterno eleifend antiopam ad,
							nam no suscipit quaerendum. At nam minimum ponderum.
						</p>
						<Button>Quick Start</Button>
					</TextCard>
				</HeroConten>
			</Edges>
			{/* <div className={'leftPurpleLine'}></div>
			<div className={'rightPurpleLine'}></div> */}
		</HeroContainer>
	);
};

export default Hero;

const HeroContainer = styled.div`
	background-color: ${({ theme }) => theme.colors.bgLight};
	width: 100%;
	padding-top: 20px;
	padding-bottom: 20px;
	-webkit-clip-path: polygon(0 0, 100% 0%, 100% 90%, 0% 100%);
	clip-path: polygon(0 0, 100% 0%, 100% 90%, 0% 100%);
	position: relative;
	/* &:before {
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
	} */
	.leftPurpleLine {
		position: absolute;
		top: 93.5%;
		left: 12.5%;
		width: 10%;
		height: 5%;
		background-color: rgba(160, 102, 170, 0.8);
		transform: matrix(1, -0.1, 0, 0.99, 0, 0);
		z-index: 2;
	}
	.rightPurpleLine {
		position: absolute;
		top: 91.5%;
		right: 12.5%;
		width: 10%;
		height: 5%;
		background-color: rgba(160, 102, 170, 0.8);
		transform: matrix(1, -0.1, 0, 0.99, 0, 0);
		z-index: 2;
	}
`;
const HeroConten = styled.div`
	width: 100%;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	padding-top: 100px;
	padding-bottom: 100px;
`;

const TextCard = styled.div`
	width: 50%;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: center;
	h1 {
		max-width: 400px;
		padding-bottom: 20px;
	}
	p {
		max-width: 380px;
		padding-bottom: 20px;
	}
	@media (max-width: ${({ theme }) => theme.breakpoints.small}) {
		align-items: center;
		width: 100%;
	}
`;
const ButtonContainer = styled.div`
	display: flex;
	justify-content: flex-end;
	align-items: center;
	width: 50%;
	margin-left: auto;
`;
