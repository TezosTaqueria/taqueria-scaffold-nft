import React from 'react';
import { ThemeProvider } from 'styled-components';
import About from './components/about/About';
import Edges from './components/edges/Edges';
import Header from './components/header/Header';
import Hero from './components/hero/Hero';
import { ContainerWrapper } from './components/styles/ContainerWrapper.styled';
import GlobalStyles from './components/styles/Global';
const theme = {
	colors: {
		bgLight: '#FFF9ED',
		primary: '#FCAF17',
		secondary: '#A066AA',
		body: '##FFFFFF',
		footer: '#003333',
		textColor: '#000000',
	},
	mobile: '768px',
	breakpoints: {
		small: '480px',
		medium: '768px',
		large: '1024px',
		xlarge: '1200px',
	},
};
export const App = () => {
	return (
		<ThemeProvider theme={theme}>
			<>
				<GlobalStyles />
				<Header />
				<Hero />
				<About />
			</>
		</ThemeProvider>
	);
};
