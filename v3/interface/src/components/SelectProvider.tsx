import { useState } from 'react'
import styled from 'styled-components'
import { use } from 'helpers/getReach'
import { COLORS } from 'theme'
import {
  HUMBLE_TERMS_AND_CONDITIONS,
  HUMBLE_PRIVACY_POLICY,
} from 'constants/links'
import { useWallet } from '@txnlab/use-wallet'
import { WalletButton } from './Common/Button'
import { FlexColumnContainer } from './Common/FlexContainer'
import ModalComponent from './Modals/ModalComponent'
import WalletIcon from './Common/WalletIcon'
import ExternalLinkIcon from './Common/ExternalLink'
import NetworkProviderView from './NetworkProvider/NetworkProviderView'

const ProviderItem = styled(WalletButton)`
  background: ${({ theme }) => theme.colors.lighterBackground};
  border: 1px solid ${({ theme }) => theme.colors.disabledButton};
  height: 56px;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.text};
  width: 100%;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`
const ContentContainer = styled.div`
  padding: 8px 16px 0;
`

const ProvidersList = styled(FlexColumnContainer)`
  margin: 36px 0 48px 0;
  .material-icons {
    color: ${({ theme }) => theme.colors.error};
  }

  .plain {
    border: 0;
    order: 99;
  }
`
type TextProps = {
  marginTop?: number
  textAlign?: 'left' | 'center' | 'right' | 'justify'
}
const Text = styled.p<TextProps>`
  font-size: 16px;
  margin-top: ${({ marginTop }) => marginTop || 16}px;
  text-align: ${({ textAlign }) => textAlign || 'left'};
`

const StyledLink = styled.a`
  color: ${COLORS.darkSage};
  text-decoration: none;
  font-weight: 800;
`

type CustomLinkProps = {
  link: string
  children: React.ReactNode
}

function CustomLink({ link, children }: CustomLinkProps) {
  return (
    <StyledLink target='_blank' href={link} rel='external noreferrer noopener'>
      {children} <ExternalLinkIcon width={16} />
    </StyledLink>
  )
}

function Disclaimer() {
  return (
    <Text textAlign='justify'>
      By connecting a wallet, you agree to the{' '}
      <CustomLink link={HUMBLE_TERMS_AND_CONDITIONS}>
        Humble Terms and Conditions
      </CustomLink>{' '}
      and acknowledge that you have read and understand the{' '}
      <CustomLink link={HUMBLE_PRIVACY_POLICY}>
        Humble Privacy Policy
      </CustomLink>
      .
    </Text>
  )
}

type SelectProviderProps = {
  onCancel: () => void
  onConnect: () => void
  open: boolean
}

export default function SelectProvider({
  onCancel,
  onConnect,
  open,
}: SelectProviderProps) {
  const { providers } = useWallet()
  const [key] = useState(new Date().getTime())
  return (
    <ModalComponent
      open={open}
      key={key}
      modalTitle='Connect a wallet'
      width={420}
      onClose={onCancel}
      zIndex={1}
    >
      <ContentContainer>
        <NetworkProviderView />
        <Disclaimer />
        <ProvidersList>
          {providers?.map((provider) => (
            <ProviderItem
              key={provider.metadata.name}
              onClick={async () => {
                await provider.connect()
                use(provider.metadata.id)
                onConnect()
              }}
            >
              <WalletIcon iconName={provider.metadata.id} />
              <b>{provider.metadata.name}</b>
            </ProviderItem>
          ))}
        </ProvidersList>
      </ContentContainer>
    </ModalComponent>
  )
}
