import { MONTHS } from 'constants/date-constants'
import { getConversions } from 'components/Common/ExchangeRate'
import { COLORS } from 'theme'
import { Token } from 'types/shared'
import { HSPoolLiquidity } from 'types/response'
import { LIQUIDITY_FEE_PH } from 'constants/reach_constants'

export const parseExchangeRateData = (
  tokA: Token,
  tokB: Token,
  data: HSPoolLiquidity[],
  light: boolean,
  flip: boolean,
  tension?: number,
  negative?: boolean,
) => {
  // Tokens with 0 amount mess up calculations
  const filteredData = data.filter(
    (d) => Number(d.tokenABalance) > 0 && Number(d.tokenBBalance),
  )
  const labels = getLabels(filteredData)

  const dataset1 = filteredData.map((d) => {
    const exchangeRate = getConversions({
      tokA,
      tokB,
      amtA: Number(d.tokenABalance),
      amtB: Number(d.tokenBBalance),
      feeFactor: LIQUIDITY_FEE_PH,
    }).reverse()

    return Number(exchangeRate[flip ? 1 : 0].secondaryTokenConversion)
  })

  return {
    labels,
    datasets: [
      {
        id: 1,
        label: '',
        data: dataset1,
        borderColor: negative ? COLORS.errorRed : COLORS.darkSage, // line colors
        backgroundColor: light ? COLORS.darkSage : COLORS.sage, // bar colors
        tension: tension ?? 1,
      },
    ],
  }
}

export const parseTokenAmountData = (
  tokA: Token,
  tokB: Token,
  data: HSPoolLiquidity[],
  flip: boolean,
  tension?: number,
) => {
  const labels = getLabels(data)

  const dataset1 = data
    .map((d) => (flip ? Number(d.tokenBBalance) : Number(d.tokenABalance)))
    .reverse()
  const dataset2 = data
    .map((d) => (flip ? Number(d.tokenABalance) : Number(d.tokenBBalance)))
    .reverse()

  const [symbol1, symbol2] = flip
    ? [tokB.symbol, tokA.symbol]
    : [tokA.symbol, tokB.symbol]

  return {
    labels,
    datasets: [
      {
        id: 1,
        label: symbol1,
        data: dataset1,
        borderColor: COLORS.darkSage, // line colors
        backgroundColor: COLORS.darkSage, // bar colors
        tension: tension ?? 1,
      },
      {
        id: 2,
        label: symbol2,
        data: dataset2,
        borderColor: COLORS.darkSage, // line colors
        backgroundColor: COLORS.darkSage, // bar colors
        tension: tension ?? 1,
      },
    ],
  }
}

export const parseAprData = (data: HSPoolLiquidity[], tension?: number) => {
  const labels = getLabels(data)

  const dataset1 = data.map((d) => Number(d.apr7d) * 100).reverse()
  return {
    labels,
    datasets: [
      {
        id: 1,
        label: '',
        data: dataset1,
        borderColor: COLORS.errorRed, // line colors
        backgroundColor: COLORS.errorRed, // bar colors
        tension: tension ?? 1,
      },
    ],
  }
}

const getLabels = (data: HSPoolLiquidity[]) =>
  data
    .map((d) => {
      const dateString = d.lastUpdated
      const date = new Date(dateString)
      return `${MONTHS[date.getMonth()]}-${date.getDate()}`
    })
    .reverse()
