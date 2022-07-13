import React from 'react';
import styled from 'styled-components';
import TezosLaptop from '../../assets/tezos_laptop.png';
import Edges from '../edge/Edges';
import { Button } from '../styles/Button.styled';

const Starting = () => {
	return (
		<StartingContainer>
			<Edges>
				<StartingConten>
					<StartingCard>
						<h1>Getting Started with a Tezos Wallet</h1>
						<p>
							To interact with this project, you will need a Tezos wallet.
							<br />
							<br />
							If you are running in a Sandbox, we recommend Temple for this
							project because it's the easiest to use Sandbox but you are free
							to use the wallet that works best for you.
						</p>
						<Button>Download Temple</Button>
					</StartingCard>
					<StartingImage>
						<img alt='TezosLaptop' src={TezosLaptop} />
					</StartingImage>
				</StartingConten>
			</Edges>
		</StartingContainer>
	);
};

export default Starting;

const StartingContainer = styled.div`
	background-color: ${({ theme }) => theme.colors.bgLight};
	width: 100%;
	padding-top: 200px;
	padding-bottom: 100px;
	border-bottom: 2px solid rgba(252, 175, 23, 0.1);
	-webkit-clip-path: polygon(0 10%, 100% 0%, 100% 90%, 0% 100%);
	clip-path: polygon(0 10%, 100% 0%, 100% 90%, 0% 100%);
	@media (max-width: ${({ theme }) => theme.breakpoints.medium}) {
		padding-top: 100px;
	}
`;
const StartingConten = styled.div`
	width: 100%;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	max-width: 1200px;
	margin-left: auto;
	margin-right: auto;
	align-items: center;
	flex-wrap: wrap;
	@media (max-width: ${({ theme }) => theme.breakpoints.medium}) {
		flex-direction: column-reverse;
	}
`;

const StartingCard = styled.div`
	width: 50%;
	display: flex;
	flex-direction: column;
	h1 {
		max-width: 450px;
	}
	p {
		margin-bottom: 50px;
		max-width: 500px;
	}
	@media (max-width: ${({ theme }) => theme.breakpoints.medium}) {
		width: 100%;
	}
`;
const StartingImage = styled.div`
	width: 50%;

	@media (max-width: ${({ theme }) => theme.breakpoints.medium}) {
		width: 100%;
		margin-bottom: 30px;
	}
`;
