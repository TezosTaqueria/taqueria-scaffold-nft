import React, { useState } from 'react';
import styled from 'styled-components';
import TopLogo from '../../assets/taqueria-logo-footer.svg';
import ECADLogo from '../../assets/footer-bottom-logo.svg';
import Edges from '../edges/Edges';
import { useMailChimp } from 'react-use-mailchimp-signup';

const footerNavbar = [
	{
		title: 'Docs',
		items: [
			{ link: '/', text: 'Quick Start' },
			{ link: '/', text: 'Roadmap' },
		],
	},
	{
		title: 'Community',
		items: [
			{ link: '/', text: 'Tezos Stack Exchange' },
			{ link: '/', text: 'Discord' },
			{ link: '/', text: 'Twitter' },
			{ link: '/', text: 'Code of Conduct' },
			{ link: '/', text: 'GitHub' },
		],
	},
	{
		title: 'Contact',
		items: [
			{ link: '/', text: 'Report Issues' },
			{ link: '/', text: 'Contribute' },
		],
	},
];

const Footer = () => {
	const { error, loading, status, subscribe, message } = useMailChimp({
		action: `https://ecadlabs.us20.list-manage.com/subscribe/post?u=8fdd00e1ab81d5f5550fadb32&amp;id=de1bfb4af9`,
	});

	const [inputs, setInputs] = useState({
		'group[218840]': '1',
	});

	const handleInputChange = (event:any) => {
		event.persist();
		setInputs((inputs) => ({
			...inputs,
			[event.target.name]: event.target.value,
		}));
	};

	const handleSubmit = (event: any) => {
		if (event) {
			event.preventDefault();
		}
		if (inputs) {
			subscribe(inputs);
		}
	};
	return (
		<FooterContainer>
			<Edges>
				<FooterTop>
					<FooterTopBox1>
						<img alt='ecad-logo-top' src={TopLogo} />
						<p>A New Way to Build on Tezos</p>
						<p>Register for updates</p>
					</FooterTopBox1>
					{footerNavbar.map((nav, index) => (
						<FooterTopBox2 key={index}>
							<p>{nav.title}</p>
							{nav &&
								nav.items.length > 0 &&
								nav.items.map((item, idx2) => (
									<a key={idx2} href={item.link}>
										{item.text}
									</a>
								))}
						</FooterTopBox2>
					))}
				</FooterTop>
				<FooterBottom>
					<img src={ECADLogo} alt='ECAD-logo' />
					<p>
						{`Copyright © ${new Date().getFullYear()} ECAD Labs - This project is licensed under Apache
						License, Version 2.0`}
					</p>
				</FooterBottom>
			</Edges>
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
`;
const FooterTop = styled.div`
	width: 100%;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	flex-wrap: wrap;
`;
const FooterTopBox1 = styled.div`
	width: 55%;
	display: flex;
	flex-direction: column;
	img {
		width: 144px;
		height: 47px;
	}
	p {
		font-style: normal;
		font-weight: 700;
		font-size: 14px;
		line-height: 22px;
		padding-top: 20px;
		padding-bottom: 20px;
		margin: 0;
		letter-spacing: 0.3px;
	}
	@media (max-width: ${({ theme }) => theme.breakpoints.medium}) {
		width: 100%;
	}
`;

const FooterTopBox2 = styled.div`
	width: 15%;
	display: flex;
	flex-direction: column;
	padding-left: 20px;
	p {
		font-style: normal;
		font-weight: 600;
		font-size: 15px;
		line-height: 22px;
		letter-spacing: 0.3px;
		margin: 0;
		padding-bottom: 10px;
	}
	a {
		font-style: normal;
		font-weight: 400;
		font-size: 14px;
		line-height: 22px;
		letter-spacing: 0.3px;
		cursor: pointer;
		text-decoration: none;
		margin: 0;
		padding-bottom: 10px;
		color: ${({ theme }) => theme.colors.textColor};
		&:hover {
			color: ${({ theme }) => theme.colors.primary};
		}
	}
	@media (max-width: ${({ theme }) => theme.breakpoints.medium}) {
		width: unset;
	}
`;

const FooterBottom = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	gap: 15px;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: space-between;
	p {
		font-size: 12px;
		@media (max-width: ${({ theme }) => theme.breakpoints.small}) {
			font-size: 10px;
		}
	}
	img {
		width: 106px;
		height: 70px;
	}
`;
const ButtonContainer = styled.div`
	display: flex;
	justify-content: flex-end;
	align-items: center;
	width: 50%;
	margin-left: auto;
`;
