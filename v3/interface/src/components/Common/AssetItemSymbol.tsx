import styled from 'styled-components'
import { AssetSymbolProps } from 'types/shared'
import VerifiedBadge from './VerifiedBadge'

/**
 * Tiny component for showing a crypto symbol (abbreviation), with additional
 * styling for selected/non-selected states
 */
const SymbolWrapper = styled.b<{ selected?: boolean }>`
  display: flex;
  gap: 4px;
  color: ${({ selected: s, theme: t }) =>
    s ? t.colors.accent : t.colors.text};
  font-size: ${({ theme }) => theme.sizes.sm};
  font-weight: 700;

  &::after {
    display: inline-block;
    padding-left: ${({ theme }) => theme.sizes.sm};
    content: ${({ selected: s }) => (s ? '' : '(selected)')};
  }

  .material-icons {
    color: ${({ theme }) => theme.colors.accent};
    font-size: ${({ theme }) => theme.sizes.sm};
    order: 2;
    margin-left: ${({ theme }) => theme.sizes.xs};
  }
`

export default function AssetItemSymbol(props: AssetSymbolProps) {
  const { symbol, selected, verifyStatus } = props
  const name = symbol?.toUpperCase()

  return (
    <SymbolWrapper selected={selected}>
      {name}
      <VerifiedBadge verifyStatus={verifyStatus} />
    </SymbolWrapper>
  )
}
