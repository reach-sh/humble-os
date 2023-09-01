import styled, { css } from 'styled-components'
import { COLORS } from 'theme'
import CryptoIcon from 'components/Common/CryptoIcon'
import { StyledNavLink } from 'components/AppNavigation/NavLink'
import SIZE from 'constants/screenSizes'
import { Trans } from '@lingui/macro'
import { Link } from 'react-router-dom'
import { colorAndOpacityToHex } from 'utils/styling'
import { useIsMobile } from 'hooks/useScreenSize'
import {
  ButtonProps,
  btnBgColor,
  btnBorder,
  btnBorderRadius,
  btnFontSize,
  btnHeight,
  btnHoverBgColor,
  btnMinWidth,
  btnPadding,
  btnTextColor,
  btnTextTransform,
  btnWidth,
} from './Button.props'
import Icon from './Icon'
import { paths } from '../../App.routes'
import VerifiedBadge from './VerifiedBadge'

export const buttonAndLinkStyles = css<ButtonProps>`
  align-items: ${({ alignItems }) => alignItems || 'center'};
  justify-content: ${({ justifyContent }) => justifyContent || 'center'};
  background-color: ${btnBgColor};
  border-radius: ${btnBorderRadius};
  border: ${btnBorder};
  color: ${btnTextColor};
  cursor: pointer;
  display: inline-flex;
  font-size: ${btnFontSize};
  font-weight: 700;
  font-family: Lato;
  height: ${btnHeight};
  margin: 0;
  min-width: ${btnMinWidth};
  padding: ${btnPadding};
  place-content: center;
  text-transform: ${btnTextTransform};
  transition: 0.15s ease-in-out;
  width: ${btnWidth};

  &[disabled] {
    border: none;
    color: ${colorAndOpacityToHex(COLORS.black, 60)};
    cursor: not-allowed;
    opacity: 0.7;
  }

  > .material-icons {
    font-size: smaller;
    margin-right: 0.3rem;
  }

  &:not([disabled]):hover {
    background-color: ${btnHoverBgColor};
    > .material-icons {
      animation: bounce 350ms ease-out;
    }
  }
`

/** Button styling */
const ButtonBase = styled.button<ButtonProps>`
  ${buttonAndLinkStyles};
`

// Use this when you want a link that looks like a button
// but doesn't inherit from ButtonBase
export const LinkAsButton = styled(Link)`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.colors.text};
`

// Use this when you want a link that looks like a button
// and inherits from ButtonBase
export const LinkWithButtonProps = styled(Link)`
  ${buttonAndLinkStyles};
  text-align: center;
  &:visited {
    color: ${({ theme }) => theme.colors.text};
  }
`

export const SubText = styled.span`
  color: #6c9688;
  font-size: 12px;
  white-space: nowrap;
  margin-top: -4px;
`

export const SmallButton = styled(ButtonBase).attrs({ size: 'sm' })``
export const GreyButton = styled(ButtonBase).attrs({
  size: 'tiny',
  variant: 'accent',
})``
export const WideButton = styled(ButtonBase).attrs({ size: 'lg', wide: true })``
export const CancelButton = styled(ButtonBase).attrs({ variant: 'cancel' })`
  flex-grow: 1;
`
export const TokenButton = styled(ButtonBase)``

export const WalletButton = styled(ButtonBase)({
  justifyContent: 'flex-start',
  size: 'lg',
})

/** Default/Base Button Component with optional inline `icon` */
const Button = styled((props: ButtonProps) => {
  const { children, icon, active, disabled, ...rest } = props
  const handleClick = () => {
    const { onClick } = props
    if (onClick) onClick()
  }

  return (
    <ButtonBase
      disabled={disabled}
      active={active}
      onClick={handleClick}
      {...rest}
    >
      <>
        {icon && <Icon iconType={icon} />}
        <span className='content'>{children}</span>
        {rest.rightIcon && <Icon iconType={rest.rightIcon} />}
      </>
    </ButtonBase>
  )
})``

/** Default/Base Button Component with optional inline `icon` */
export const ListToggle = styled(Button).attrs({
  icon: 'keyboard_arrow_right',
  variant: 'cancel',
})`
  border-radius: 4px;
  display: grid;
  grid-template-columns: auto 24px;
  height: 32px;
  padding: 0.2rem 0.8rem;
  text-align: left;
  margin-bottom: ${({ active }) => (active ? '0.6rem' : 0)};

  .content {
    display: block;
    min-width: 160px;
  }

  &:not([disabled]):hover .material-icons,
  .material-icons {
    animation: none;
    order: 99;
  }
`

const PoolLink = styled(StyledNavLink)`
  position: relative;
  right: 9.5rem;
  top: 2rem;
  padding: 0.75rem 1.25rem;
  border-radius: 16px;
  background-color: ${({ theme }) => `${theme.colors.darkButtonBg}`};
  color: ${({ theme }) => theme.colors.darkButtonText};
  &:hover {
    background-color: ${({ theme }) => theme.colors.buttonHover};
    opacity: 0.95;
  }
  &.active {
    background-color: ${({ theme }) => theme.colors.darkButtonBg};
  }
  @media (max-width: ${SIZE.lg}) {
    right: 0;
    top: -1rem;
  }
`

type BackToPoolButtonProps = {
  returnTo?: string | null
}

export function BackToPoolButton(
  props: BackToPoolButtonProps = { returnTo: 'pool' },
) {
  const { returnTo } = props
  return (
    <PoolLink to={returnTo === 'farm' ? paths.farm.index : paths.pool.index}>
      {'<'}{' '}
      <Trans>{returnTo === 'farm' ? 'Back to Farms' : 'Back to Pools'}</Trans>
    </PoolLink>
  )
}

const TokenSelectorWrapper = styled.div<{ disabled?: boolean }>`
  display: flex;
  align-items: flex-start;
  max-width: 200px;
  border-radius: 6px;
  transition: 0.15s ease-in-out;
  span.content {
    font-weight: bold;
  }
  &:hover {
    background: ${({ theme, disabled }) =>
      disabled ? 'inherit' : theme.colors.card};
    cursor: ${({ disabled }) => (disabled ? 'inherit' : 'pointer')};
  }
`
const TokData = styled.div`
  display: flex;
  flex-direction: column;
`
const TokSelContent = styled.div`
  margin-left: 5px;
  position: relative;
  bottom: 1px;
  display: flex;
`

export const TokId = styled(SubText)`
  margin-top: 2px;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  padding: 0 4px;
  width: fit-content;
`

const TokSymbolAndIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

export const TokSelector = ({
  cryptoIcon,
  children,
  locked,
  testLabel,
  tokenName,
  onClick,
  id,
  tokenStatus,
}: {
  cryptoIcon: string
  children: React.ReactNode
  locked?: boolean
  testLabel: string
  tokenName: string
  onClick: () => void
  id: string | number
  tokenStatus?: 'trusted' | 'verified' | 'suspicious' | 'unverified'
}) => {
  const isMobile = useIsMobile()

  return (
    <TokenSelectorWrapper
      onClick={onClick}
      disabled={locked}
      data-testid={testLabel}
    >
      <CryptoIcon symbol={cryptoIcon} id={id} />
      <TokSelContent>
        <TokData>
          <TokSymbolAndIcon>
            <span className='content'>{children}</span>
            <VerifiedBadge verifyStatus={tokenStatus} isText={!isMobile} />
            {!locked && <Icon iconType='expand_more' />}
          </TokSymbolAndIcon>
          <SubText>{tokenName}</SubText>
          <TokId>ID: {id}</TokId>
        </TokData>
      </TokSelContent>
    </TokenSelectorWrapper>
  )
}

export default Button
