import styled from 'styled-components'
import { useTheme } from 'contexts/theme'
import { COLORS } from 'theme'
import useBlockTime from 'hooks/useBlockTime'
import Icon from './Common/Icon'
import packageInfo from '../../package.json'
import AppHelp from './AppHelp'
import { FlexColumnContainer } from './Common/FlexContainer'

const Container = styled(FlexColumnContainer)`
  margin-bottom: 0px;
`
const AppVersion = styled.span`
  font-size: 12px;
  text-align: right;
  color: ${COLORS.darkSage};
  width: 140px;
`
const BlockTime = styled.div.attrs({ className: 'block-time' })`
  display: flex;
  align-items: center;
  font-size: 12px;
  color: ${COLORS.darkSage};
  width: 140px;
`

const Contents = styled.div`
  color: ${COLORS.darkSage};
  display: grid;
  font-size: smaller;
  grid-template-columns: 2fr 1fr;
  padding: 0 ${({ theme }) => `${theme.sizes.sm}`}
    ${({ theme }) => `${theme.sizes.sm}`} 0;

  > * {
    align-items: center;
    display: flex;
  }

  > .material-icons {
    opacity: 0.2;
  }
`

const LowerBar = styled.div<{ dark: boolean }>`
  display: flex;
  justify-content: space-between;
  background-color: ${({ dark }) => (dark ? COLORS.darkGray : COLORS.white)};
  padding: 8px;
`

const PriceAttribution = styled.a.attrs({
  href: 'https://www.coingecko.com',
  target: '_blank',
  rel: 'noreferrer',
})`
  display: flex;
  font-size: smaller;
  place-content: center;
  align-items: center;
  width: 140px;
  color: ${COLORS.darkSage};
`

/** Global Footer for application */
const Footer = () => {
  const { blockTime } = useBlockTime()
  const { theme } = useTheme()
  const isDarkMode = theme === 'Dark'

  return (
    <Container>
      <Contents>
        <div />
        <AppHelp />
      </Contents>
      <LowerBar dark={isDarkMode}>
        {blockTime > 0 ? (
          <BlockTime>
            <Icon iconType='circle' />
            <span>{` Block ${blockTime}`}</span>
          </BlockTime>
        ) : (
          <Icon iconType='crop_square' />
        )}
        <PriceAttribution>Prices by Coingecko</PriceAttribution>
        <AppVersion>Version: {packageInfo.version}</AppVersion>
      </LowerBar>
    </Container>
  )
}

export default Footer
