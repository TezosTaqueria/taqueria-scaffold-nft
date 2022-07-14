import React from 'react';
import styled from 'styled-components';
import { ConnectButton } from './ConnectButton';
import Logo from '../../assets/Taqueria_magenta_beta.svg';
import Edges from '../edge/Edges';

const Header = () => {
	return (
		<HeaderContainer>
			<Edges>
				<HeaderConten>
					<LogoContainer>
						<img alt='ECAD_Logo' src={Logo} />
					</LogoContainer>
					<ButtonContainer>
						<ConnectButton />
					</ButtonContainer>
				</HeaderConten>
			</Edges>
		</HeaderContainer>
	);
};

export default Header;

const HeaderContainer = styled.div`
	background-color: ${({ theme }) => theme.colors.bgLight};
	width: 100%;

	border-bottom: 2px solid rgba(252, 175, 23, 0.1);
`;
const HeaderConten = styled.div`
	width: 100%;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	padding-top: 20px;
	padding-bottom: 20px;
`;

const LogoContainer = styled.div`
	width: 50%;
	img {
		width: 200px;
		height: 50px;
	}
`;
const ButtonContainer = styled.div`
	display: flex;
	justify-content: flex-end;
	align-items: center;
	width: 50%;
	margin-left: auto;
`;
