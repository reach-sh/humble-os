import { createGlobalStyle } from 'styled-components'

const GlobalStyles = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    font-family: 'lato', Tahoma, Helvetica, Arial, Roboto, sans-serif;
    transition: all 0.50s linear;
  }
  button {
    font-family: 'lato', Tahoma, Helvetica, Arial, Roboto, sans-serif;
  }
  `

export default GlobalStyles
