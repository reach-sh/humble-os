import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import ModalComponent from 'components/Modals/ModalComponent'
import Button from 'components/Common/Button'
import AnnouncePng from 'assets/announce.png'
import useGlobalUser from 'hooks/useGlobalUser'

const IDLE_TIMEOUT_MS = 7 * 60 * 1000 // 7 min

const ModalContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: space-between;
  padding: 12px 24px 24px 24px;
`

const Title = styled.div`
  align-self: flex-start;
  font-weight: 900;
  font-size: 32px;
`

const Message = styled.div`
  align-self: flex-start;
  font-weight: 500;
  font-size: 17px;
`

const StyledButton = styled(Button)`
  margin-top: 16px;
`

const IdleUserNotification = () => {
  const { walletAddress } = useGlobalUser(['walletAddress'])
  const [showIdleNotification, setShowIdleNotification] = useState(false)

  useEffect(() => {
    if (!walletAddress) return undefined
    let timer: NodeJS.Timeout

    const setTimer = () => {
      timer = setTimeout(() => setShowIdleNotification(true), IDLE_TIMEOUT_MS)
    }
    setTimer()

    const resetTimer = () => {
      clearTimeout(timer)
      setTimer()
    }

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ]

    events.forEach((e) => document.addEventListener(e, resetTimer, true))

    return () => {
      clearTimeout(timer)
      events.forEach((e) => document.removeEventListener(e, resetTimer, true))
    }
  }, [walletAddress])

  return (
    <ModalComponent open={showIdleNotification} kind='noClose' width={382}>
      <ModalContent>
        <img src={AnnouncePng} alt='Announce' />
        <Title>{t`Hi, there!`}</Title>
        <Message>
          {t`🔄 You've been inactive for a long while. Please refresh to keep using
          Humble.`}
        </Message>
        <StyledButton onClick={() => window.location.reload()} wide>
          Refresh
        </StyledButton>
      </ModalContent>
    </ModalComponent>
  )
}

export default IdleUserNotification
