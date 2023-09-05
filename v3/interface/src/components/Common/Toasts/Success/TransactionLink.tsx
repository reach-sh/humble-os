import { CURRENT_PROVIDER, PROVIDERS } from 'constants/reach_constants'
import styled from 'styled-components'

type TransactionLinkProps = {
  acct: string
  className?: string
}

const TransactionLink = ({ acct, className }: TransactionLinkProps) => (
  <a
    className={className}
    rel='noopener noreferrer'
    target='_blank'
    href={`https://${
      CURRENT_PROVIDER === PROVIDERS.MAINNET
        ? ''
        : `${CURRENT_PROVIDER.toLowerCase()}.`
    }algoexplorer.io/address/${acct}`}
  >
    <span style={{ color: '#f8f4e6', marginLeft: '1em', fontWeight: 800 }}>
      View on Algorand &#8599;
    </span>
  </a>
)

export default styled(TransactionLink).attrs({})`
  &.transaction-link {
    font-weight: 800;
    color: #f8f4e6;
    font-family: Lato;
    font-style: normal;
    line-height: 19.2px;
    margin-left: 1em;
    margin-bottom: 1.25em;
    padding-bottom: 1em;
  }

  &&.arrowFilter {
    invert(97%) sepia(5%) saturate(1099%) hue-rotate(315deg) brightness(104%) contrast(94%);
  }
`
