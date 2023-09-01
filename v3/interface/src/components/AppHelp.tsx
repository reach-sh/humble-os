import { HUMBLE_SWAP_FAQ } from 'constants/links'
import { useState } from 'react'
import styled from 'styled-components'
import { useIsMobile } from 'hooks/useScreenSize'
import Button from './Common/Button'
import { HelpLinks, HelpLink } from './HelpLinks'

const Container = styled.div`
  place-content: flex-end;
`

const StyledButton = styled(Button)<{ isMobile: boolean }>`
  min-width: ${({ isMobile }) => (isMobile ? '80px' : '140px')};
`

type HLink = { href: string; text: string }
const links: HLink[] = [
  { href: HUMBLE_SWAP_FAQ, text: 'Read FAQ' },
  { href: 'https://twitter.com/HumbleDefi', text: 'HumbleSwap Twitter' },
  {
    href: 'https://discord.gg/wG3wtv7qn6',
    text: 'Join the Discord',
  },
  {
    href: 'https://t.co/ARPI9rxcFP',
    text: 'Join the Telegram',
  },
  {
    href: 'https://www.reddit.com/r/HumbleDefi/',
    text: 'Join the Reddit',
  },
]

const AppHelp = styled(() => {
  const [hide, setHidden] = useState(true)
  const listenerOpts = { capture: false }
  const isMobile = useIsMobile()
  const hideList = (e?: any) => {
    const classes = e?.target?.classList
    if (
      classes?.contains('app-help') ||
      classes?.contains('help-link') ||
      classes?.contains('trigger') ||
      classes?.contains('content')
    )
      return
    window.removeEventListener('mousedown', hideList, listenerOpts)
    setHidden(true)
  }
  const showList = () => {
    if (hide) {
      window.addEventListener('mousedown', hideList, listenerOpts)
      setHidden(false)
    } else hideList()
  }

  return (
    <Container className='app-help'>
      {!hide && (
        <HelpLinks
          unwrapChildren
          data={links}
          itemText={(l: HLink) => (
            <HelpLink
              className='help-link'
              href={l.href}
              target='_blank'
              rel='noopener noreferrer'
            >
              {l.text}
            </HelpLink>
          )}
        />
      )}

      <StyledButton
        isMobile={isMobile}
        variant='accent'
        className='trigger'
        onClick={showList}
      >
        Help
      </StyledButton>
    </Container>
  )
})``

export default AppHelp
