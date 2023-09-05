import { useEffect, useRef, useState } from 'react'
import { t } from '@lingui/macro'
import ModalComponent from 'components/Modals/ModalComponent'
import Button from 'components/Common/Button'
import styled from 'styled-components'
import { useTheme } from 'contexts/theme'
import THEME, { COLORS } from 'theme'
import { paths } from 'App.routes'
import { Link } from 'react-router-dom'
import { copyToClipboard } from 'utils/input'
import SIZE from 'constants/screenSizes'
import ChainIcon from 'components/Common/Icons/chain'
import FingersZero from 'components/Common/Icons/fingers-zero'

const VStack = styled.div`
  display: flex;
  flex-direction: column;
`

const ContentContainer = styled(VStack)`
  gap: 32px;
  padding: 18px 72px 0 72px;

  @media (max-width: ${SIZE.sm}) {
    padding: 18px 0 0 0;
  }
`
const ModalContent = styled(VStack)`
  align-items: center;
  gap: 32px;
  padding: 40px 12px 12px;

  @media (max-width: ${SIZE.sm}) {
    padding: 18px 0 0 0;
  }
`
const BorderContainer = styled(VStack)`
  align-items: center;
  gap: 18px;
  border: 1px solid ${({ theme }) => theme.colors.text};
  border-radius: 10px;
  padding: 8px 0;
`
const BorderBoxContainer = styled(VStack)`
  align-items: center;
  margin: 0 30px;
  gap: 18px;
  border: 1px solid ${({ theme }) => theme.colors.text};
  border-radius: 10px;
  padding: 10px;
`
const BorderBox = styled(VStack)<{ dark: boolean }>`
  align-items: center;
  background-color: ${({ dark }) =>
    dark ? COLORS.DMMidGray : COLORS.darkCream};
  border-radius: 12px;
  padding: 9px;
  width: 100%;
`

type Props = {
  contractId: string
  isCreateFarm: boolean
  open: boolean
  onClose: () => void
}
const TextContainer = styled.div`
  width: 70%;

  @media (max-width: ${SIZE.sm}) {
    width: 96%;
  }
`

const CopyContainer = styled(VStack)`
  width: 80%;
  justify-content: center;
  align-items: center;
  height: 106px;
  padding: 0 28px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.background};
  @media (max-width: ${SIZE.sm}) {
    width: 96%;
  }
`
const CopyButton = styled(Button)`
  width: 65px;
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.linkText};
  font-weight: 700;
  font-family: Lato;
`

const CopyLink = styled.button`
  align-items: center;
  background-color: ${COLORS.white};
  border-radius: 10px;
  border: none;
  color: ${COLORS.darkSage};
  cursor: pointer;
  display: flex;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  width: auto;
  &:focus-visible {
    outline: none;
  }
`
const StyledLink = styled(Link)`
  width: 100%;
`

const Title = styled.h2`
  font-weight: 700;
  font-size: 20px;
`
const Text = styled.p<{
  fontSize?: number
  textAlign?: 'left' | 'right' | 'center'
  padding?: string
}>`
  line-height: 20px;
  font-size: ${({ fontSize }) => fontSize ?? 16}px;
  text-align: ${({ textAlign }) => textAlign ?? 'left'};
  padding: ${({ padding }) => padding || ''};
`

const copyAnimation = [
  { transform: 'scale(1)' },
  { transform: 'scale(0.7)' },
  { transform: 'scale(1)' },
]

const animationTime = {
  duration: 300,
  iterations: 1,
}

interface CreateFarmModalProps {
  linkToFarm: string
  onClose: () => void
  open: boolean
}

const CreateFarmModal = ({
  linkToFarm,
  onClose,
  open,
}: CreateFarmModalProps) => {
  const { theme } = useTheme()
  const isDarkMode = theme === 'Dark'
  const timerRef: { current: number | undefined } = useRef()
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const handleCopyLink = () => {
    setIsCopied(true)
    copyToClipboard(linkToFarm)
    timerRef.current = window.setTimeout(() => setIsCopied(false), 3000)
  }
  return (
    <ModalComponent
      open={open}
      modalTitle='Your farm was created and listed'
      onClose={onClose}
      width={420}
    >
      <ModalContent>
        <FingersZero dark={isDarkMode} />
        <BorderBoxContainer>
          <BorderBox dark={isDarkMode}>
            <Text fontSize={14} textAlign='center'>
              {t`Here is the link:`}
            </Text>
            <Text textAlign='center' padding='0 0 14px 0'>
              <strong data-testid='farm-link'>{linkToFarm}</strong>
            </Text>
            <CopyLink onClick={() => handleCopyLink()}>
              <ChainIcon />
              {isCopied ? t`Copied!` : t`Copy link`}
            </CopyLink>
          </BorderBox>
        </BorderBoxContainer>
        <StyledLink to={paths.farm.index}>
          <Button size='lg' wide data-testid='return-to-farms-btn'>
            <strong>Return to Humble</strong>
          </Button>
        </StyledLink>
      </ModalContent>
    </ModalComponent>
  )
}

interface NewFarmModalProps {
  contractId: string
  onClose: () => void
  open: boolean
}

const NewFarmModal = ({ contractId, onClose, open }: NewFarmModalProps) => {
  const { theme } = useTheme()
  const contractIDRef = useRef(null)
  const { colors } = THEME[theme]
  return (
    <ModalComponent
      open={open}
      modalTitle='Your farm was created but not listed yet'
      onClose={onClose}
      width={620}
      background={colors.popoverBg}
    >
      <ContentContainer>
        <BorderContainer>
          <Title>Your next step:</Title>
          <TextContainer>
            <Text textAlign='center'>
              Send email containing the contract ID to{' '}
              <strong>farm@humble.sh</strong>.
            </Text>
          </TextContainer>
          <CopyContainer>
            <Text fontSize={14} textAlign='center'>
              Your contract ID:
            </Text>
            <Text ref={contractIDRef} textAlign='center' padding='0 0 14px 0'>
              <strong>{contractId}</strong>
            </Text>
            <CopyButton
              size='tiny'
              wide={false}
              onClick={() => {
                copyToClipboard(contractId)
                if (contractIDRef.current) {
                  // @ts-ignore
                  contractIDRef.current.animate(copyAnimation, animationTime)
                }
              }}
            >
              <strong>Copy ID</strong>
            </CopyButton>
          </CopyContainer>
          <TextContainer>
            <Text textAlign='center'>
              We&apos;ll be in touch within 3 working days to list your farm on
              Humble
            </Text>
          </TextContainer>
        </BorderContainer>
        <Link to={paths.farm.index}>
          <Button size='lg' wide data-testid='return-to-farms-btn'>
            <strong>Return to Humble</strong>
          </Button>
        </Link>
      </ContentContainer>
    </ModalComponent>
  )
}

const CreateFarmSuccess = ({
  contractId,
  isCreateFarm,
  onClose,
  open,
}: Props) => {
  const linkToFarm = `${window.location.origin}/farm?id=${contractId}`

  return isCreateFarm ? (
    <CreateFarmModal linkToFarm={linkToFarm} onClose={onClose} open={open} />
  ) : (
    <NewFarmModal contractId={contractId} onClose={onClose} open={open} />
  )
}

export default CreateFarmSuccess
