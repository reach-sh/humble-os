import { ReactNode } from 'react'
import styled, { css } from 'styled-components'
import {
  FlexColumnContainer,
  GridContainer,
} from 'components/Common/FlexContainer'
import ImageLoader from 'components/Common/ImageLoader'
import { COLORS } from 'theme'
import CryptoIconPair from 'components/Common/CryptoIconPair'
import { Token } from 'types/shared'
import { CURRENT_PROVIDER, PROVIDERS } from 'constants/reach_constants'
import { getAppEnvironment } from 'helpers/getAPIURL'

export type GenericModalProps = {
  open: boolean
  title?: string
  children?: ReactNode
  sticky?: boolean
  cancellationText?: string
  width?: number
  onConfirm: () => any
  onClose?: () => void
}

export type SuccessModalProps = {
  tokenB: Token
  amtB: string
} & Pick<GenericModalProps, 'open' | 'onClose'>

const fontCSS = css`
  font-family: Lato;
  font-style: normal;
`
export const BoxSection = styled.div<{ dark?: boolean }>`
  border-radius: 8px;
  border: 1px solid ${({ dark }) => COLORS[dark ? 'DMMidGray' : 'black']};
  margin: 0 auto 20px;
  max-width: 350px;
  padding: 16px;
`
export const ContentContainer = styled.div`
  background: ${({ theme }) => theme.colors.walletWarningBg};
  border-radius: 1em;
  width: 26.25em;
  overflow: hidden;
`
export const ModalTitle = styled.h2`
  ${fontCSS}
  color: ${({ theme }) => theme.colors.walletWarningText};
  font-size: 1.5em;
  font-weight: bold;
  height: 1.8125em;
  line-height: 1.8125em;
  text-align: center;
`
export const HeadingImage = styled(ImageLoader)`
  height: 200px;
  width: 200px;
`
export const Heading = styled(FlexColumnContainer)`
  padding: 2rem 0;
  z-index: 1;

  p {
    margin-bottom: 1.2em;
  }
`
export type SpanCSSProps = {
  highlight?: boolean
  fontSize?: number
  fontWeight?: number
  marginSides?: boolean
  dark?: boolean
  iconLabel?: boolean
}

const spanColor = (dark?: boolean, hlt?: boolean) => {
  if (hlt) return COLORS.yellow
  return dark ? COLORS.white : COLORS.black
}
export const ModalText = styled.span<SpanCSSProps>`
  font-size: ${({ fontSize }) => fontSize || '32'}px;
  font-weight: ${({ fontWeight }) => fontWeight || '700'};
  color: ${({ dark, highlight }) => spanColor(dark, highlight)};
  margin: 0px ${({ marginSides }) => (marginSides ? '12' : '0')}px;
  margin-left: ${({ iconLabel }) => (iconLabel ? '8' : '0')}px;
`
export const LargeText = styled(ModalText).attrs({ fontSize: 16 })``

export const RowContainer = styled(GridContainer)`
  margin-top: 5px;
  overflow: hidden;
  padding: 5px 0;

  &:first-of-type {
    margin-top: 13px;
  }

  > div:last-of-type {
    overflow: hidden;

    span:first-child {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`
type PoolItemProps = { tokA?: Token; tokB?: Token }
export const ModalPoolItem = (props: PoolItemProps) => {
  const { tokA, tokB } = props
  return (
    <CryptoIconPair
      showText
      firstTokId={tokA?.id}
      firstTokSymbol={tokA?.symbol}
      secondTokId={tokB?.id}
      secondTokSymbol={tokB?.symbol}
    />
  )
}

export const ModalDescription = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  line-height: 1.1rem;
  margin-bottom: 2.5rem;
  margin-top: 0.8rem;
  text-align: center;
`

const PoolIdLink = styled.a.attrs({
  target: '_blank',
  rel: 'noopener noreferrer',
})`
  font-size: 0.8rem;
  color: ${COLORS.midGray};
  text-align: right;
`

export const PoolAddressLink = ({ id }: { id: string }) => {
  const prefix =
    CURRENT_PROVIDER === PROVIDERS.MAINNET ? '' : `${getAppEnvironment(true)}.`
  const baseUrl = `https://${prefix}algoexplorer.io/`
  const url = `${baseUrl}/application/${id}`
  const title = `View Pool ${id} on Algoexplorer`

  return (
    <PoolIdLink title={title} href={url}>
      {id}
    </PoolIdLink>
  )
}
