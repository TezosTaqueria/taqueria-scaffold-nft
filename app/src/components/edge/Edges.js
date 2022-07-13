import React from 'react';
import styled from 'styled-components';

export default function Edges(props) {
	return <Section {...props}>{props.children}</Section>;
}

const Section = styled.section`
	width: 1300px;
	max-width: 92%;
	margin: 0 auto;

	@media (max-width: ${({ theme }) => theme.breakpoints.medium}) {
		max-width: 90%;
	}
	@media (max-width: ${({ theme }) => theme.breakpoints.large}) {
		max-width: 85%;
	}
`;
