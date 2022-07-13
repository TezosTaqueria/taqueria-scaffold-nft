import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');

  * {
    box-sizing: border-box;
  }

  body {
    background: ${({ theme }) => theme.colors.body};
    font-family: 'Montserrat', sans-serif;   
    font-size: 16px;
    margin: 0;
    padding: 0;
  }

  p {
   letter-spacing: 0.3px;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
  }
  h1 {
    font-style: normal;
    font-weight: 600;
    font-size: 40px;
    line-height: 56px;
    margin:0;
  }

  .boldTex {
    font-style: normal;
    font-weight: 700;
    font-size: 14px;
    line-height: 22px;
  }

  img {
    max-width: 100%;
}
`;

export default GlobalStyles;
