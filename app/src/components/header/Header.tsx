import React from 'react';
import styled from 'styled-components';
import { ConnectButton } from '../connect-button';
import Logo from '../../assets/ecad-logo.svg';
import Edges from '../edges/Edges';

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
	padding-top: 20px;
	padding-bottom: 20px;
	border-bottom: 2px solid rgba(252, 175, 23, 0.1);
`;
const HeaderConten = styled.div`
	width: 100%;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	padding-top: 25px;
	padding-bottom: 25px;
`;

const LogoContainer = styled.div`
	width: 50%;
	img {
		width: 213px;
		height: 69px;
	}
`;
const ButtonContainer = styled.div`
	display: flex;
	justify-content: flex-end;
	align-items: center;
	width: 50%;
	margin-left: auto;
`;
