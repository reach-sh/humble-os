import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import CURRENCIES from 'constants/supported-currencies'
import {
  currencyDisplaySymbol,
  currencyDisplayUnit,
  setCurrencyDisplayUnit,
} from 'prices'
import { useState } from 'react'
import { getCurrentNetwork } from 'helpers/getReach'

const Container = styled.div`
  margin: 1.5rem 0;
  display: flex;
  justify-content: space-between;
`

const LanguageText = styled.p``

const CurrencySelect = styled.select`
  flex-grow: 1;
  margin-left: 2rem;
  padding: 5px 3px;
  border-radius: 4px;
  border: none;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  &:active,
  &:focus {
    outline: none;
  }
`

/** Currency Display Unit (settings) components */
const DisplayCurrency = () => {
  const [unit, setUnit] = useState(currencyDisplayUnit())
  const connector = getCurrentNetwork()
  const currencies = [...CURRENCIES]
  if (!currencies.includes(connector)) currencies.unshift(connector)

  const selectUnit = (e: any) => {
    const { value } = e.target
    setUnit(value)
    setCurrencyDisplayUnit(value)
  }

  return (
    <Container>
      <LanguageText>
        <Trans>Currency Unit</Trans>
      </LanguageText>

      <CurrencySelect onChange={selectUnit} value={unit}>
        {currencies.map((val: string) => (
          <option key={val} value={val}>
            {`${val.toUpperCase()} (${currencyDisplaySymbol(val)})`}
          </option>
        ))}
      </CurrencySelect>
    </Container>
  )
}

export default DisplayCurrency
