import styled from 'styled-components';

export const Button = styled.button`
	border-radius: 3px;
	border: none;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
	cursor: pointer;
	font-size: 16px;
	font-weight: 700;
	padding: 12px 35px;
	background-color: ${({ bg, theme }) => bg || theme.colors.primary};
	color: ${({ color, theme }) => color || theme.colors.textColor};
	font-style: normal;
	font-weight: 600;
	font-size: 15px;
	line-height: 22px;
	letter-spacing: 0.3px;
	transition-duration: 0.5s;
	width: fit-content;
	&:hover {
		opacity: 0.9;
		transform: scale(0.98);
		background-color: ${({ theme }) => theme.colors.secondary};
	}

	@media (max-width: ${({ theme }) => theme.breakpoints.small}) {
		padding: 8px 25px;
	}
`;
