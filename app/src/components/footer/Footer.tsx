import React from 'react';
import styled from 'styled-components';
import TopLogo from '../../assets/taqueria-logo-footer.svg';


const Footer = () => {
	return (
		<FooterContainer>
			<FooterContent>
				<img alt='ecad-logo-top' src={TopLogo} />
				<p className='headline'>A New Way to Build on Tezos</p>
			</FooterContent>
		</FooterContainer>
	);
};

export default Footer;

const FooterContainer = styled.div`
	background-color: ${({ theme }) => theme.colors.body};
	box-shadow: 0px -4px 12px rgba(0, 0, 0, 0.2);
	width: 100%;
	padding-top: 80px;
	padding-bottom: 20px;
	border-bottom: 2px solid rgba(252, 175, 23, 0.1);
	display: flex;
	flex-direction: column;
	align-items: center
`;

const FooterContent = styled.div`
	max-width: 200px;
`;
