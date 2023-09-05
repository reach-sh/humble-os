import {
  createRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import LineChart from 'components/Charts/BaseCharts/LineChart'
import BarChart from 'components/Charts/BaseCharts/BarChart'
import { useTheme } from 'contexts/theme'
import styled from 'styled-components'
import VerifiedBadge from 'components/Common/VerifiedBadge'
import { COLORS } from 'theme'
import LineChartIcon from 'components/Common/Icons/line-chart'
import SIZE from 'constants/screenSizes'
import BarChartIcon from 'components/Common/Icons/bar-chart'
import IconButtonWrapper from 'components/Common/IconButtonWrapper'
import { getPoolHistoricalData } from 'utils/getServerResource'
import { HSPoolLiquidity } from 'types/response'
import FlipArrowsIcon from 'components/Common/Icons/flip-arrows'
import { ChartJSOrUndefined } from 'react-chartjs-2/dist/types'
import { ScatterDataPoint } from 'chart.js'
import {
  parseAprData,
  parseExchangeRateData,
  parseTokenAmountData,
} from 'components/Charts/utils'
import { Token } from 'types/shared'
import { getTokenById } from 'helpers/pool'
import CryptoIconPair from 'components/Common/CryptoIconPair'
import { GlobalDex } from 'state/reducers/dex'
import { LINE_CHART_TENSION } from '../shared'

type ViewType = 'line' | 'bar'
type DatasourceType = 'price' | 'tvl' | 'apr'
const FlexContainer = styled.div`
  display: flex;
`

const Container = styled(FlexContainer)`
  background-color: ${({ theme }) => theme.colors.lighterBackground};
  border: 1.5px solid ${({ theme }) => theme.colors.ring1};
  border-radius: 16px;
  padding: 24px;
  flex-direction: column;
`

const TopSection = styled(FlexContainer)`
  flex-direction: row;
  justify-content: space-between;
`

const SecondTopSection = styled(TopSection)`
  min-height: 96px;

  @media (max-width: ${SIZE.sm}) {
    min-height: 64px;
  }
`

const SymbolSection = styled(FlexContainer)`
  flex-direction: row;
  justify-content: flex-start;
`
const CurrentValueSection = styled(SymbolSection)`
  gap: 20px;
  align-items: center;
`

const Value = styled.div`
  font-size: 60px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: ${SIZE.sm}) {
    font-size: 40px;
  }
`

const DeltaValue = styled.div<{ positive: boolean }>`
  padding-top: 20px;
  font-size: 30px;
  color: ${({ theme, positive }) =>
    positive ? theme.colors.linkText : theme.colors.error};

  @media (max-width: ${SIZE.sm}) {
    padding-top: 10px;
    font-size: 28px;
  }
`

const ModeButtonSection = styled(FlexContainer)`
  flex-direction: row;
  justify-content: flex-end;
`

const ModalButtonWrapper = styled(ModeButtonSection)`
  gap: 20px;
`

const Symbol = styled.div`
  font-size: 14px;
  grid-column: 2;
  white-space: nowrap;
  font-weight: 700;
  @media (max-width: ${SIZE.sm}) {
    grid-column-start: 2;
    grid-column-end: 4;
    grid-row: 1;
  }

  display: flex;
  gap: 4px;
  align-items: center;
`

const DataSourceContainer = styled.div`
  display: flex;
  gap: 6px;
`
const DatasourceButton = styled.div<{ selected: boolean; light: boolean }>`
  background-color: ${({ light, selected, theme }) =>
    selected
      ? theme.colors.darkButtonBg
      : light
      ? ''
      : theme.colors.lighterBackground};
  color: ${({ light, selected, theme }) =>
    selected
      ? theme.colors.darkButtonText
      : light
      ? theme.colors.text
      : theme.colors.darkButtonText};
  border-radius: 7px;
  cursor: pointer;
  width: 82px;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const CustomTooltip = styled.div<{ top: number; left: number }>`
  position: absolute;
  top: ${({ top }) => top + 30}px;
  left: ${({ left }) => left - 80 + 23}px;
  height: 90px;
  width: 160px;
  border: 2.5px solid ${({ theme }) => theme.colors.ring1};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  pointer-events: none;
`

const UpperCustomtooltip = styled.div`
  width: 100%;
  height: 60px;
  font-size: 30px;
  font-weight: 900;
  padding: 0 4px;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  border-radius: 6px;
  @media (max-width: ${SIZE.sm}) {
    top: -1px;
  }
`

const LowerCustomTooltip = styled.div`
  height: 30px;
  left: -1px;
  bottom: -1px;
  width: 101%;
  border-radius: 0 0 2px 2px;
  background-color: ${({ theme }) => theme.colors.ring1};
  padding: 4px;
  text-align: center;
`

const ChartLine = styled.div<{ top: number; left: number }>`
  position: absolute;
  bottom: 0;
  height: 36px;
  width: 2px;
  background-color: ${({ theme }) => theme.colors.ring1};
  top: ${({ top }) => top + 30 + 90}px;
  left: ${({ left }) => left + 23}px;
  pointer-events: none;

  @media (max-width: ${SIZE.sm}) {
    height: 6px;
  }
`

const makeViewOptions = (view: 'line' | 'bar') => ({
  responsive: true,
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      display: view === 'bar',
      grid: {
        display: false,
      },
    },
  },
})

const makeStyle = (light: boolean) => ({
  backgroundColor: light ? COLORS.milk : COLORS.darkGray,
})

const getDeltaValues = (currentValue?: number, previousValue?: number) => {
  if (previousValue === undefined || currentValue === undefined) {
    return [0, 0]
  }

  const d = currentValue - previousValue
  const pct = currentValue ? (d / currentValue) * 100 : 0

  return [d, pct]
}

type PoolHistoryChartProps = {
  poolId: string
}

type TooltipDataType = {
  label: string
  value: string
}

const labelMap: { [i in DatasourceType]: string } = {
  price: 'Price',
  tvl: 'TVL',
  apr: 'APR',
}

const isOverflown = (element: HTMLDivElement) =>
  element.scrollHeight > element.clientHeight ||
  element.scrollWidth > element.clientWidth

const PoolHistoryChart = ({ poolId }: PoolHistoryChartProps) => {
  const ref = createRef<HTMLDivElement>()
  const { theme } = useTheme()
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const currentWidth = ref.current?.offsetWidth
    const currentHeight = ref.current?.offsetHeight
    if (
      currentWidth &&
      currentHeight &&
      currentWidth !== containerSize.width &&
      currentHeight !== containerSize.height
    ) {
      setContainerSize({
        width: currentWidth,
        height: currentHeight,
      })
    }
  }, [ref])
  const [dataview, setDataview] = useState<ViewType>('line')
  const [datasource, setDatasource] = useState<DatasourceType>('price')
  const lineChartRef =
    useRef<
      ChartJSOrUndefined<'line', (number | ScatterDataPoint | null)[], unknown>
    >()

  const barChartRef =
    useRef<ChartJSOrUndefined<'bar', (number | null)[], unknown>>()

  const upperTooltipRef = useRef<HTMLDivElement | null>(null)

  const [flip, setFlip] = useState(false)
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({
    top: 0,
    left: 0,
    biasX: 0,
    biasY: 0,
  })
  const [tooltipData, setTooltipData] = useState<TooltipDataType | undefined>(
    undefined,
  )
  const [deltaVisible, setDeltaVisible] = useState(false)
  const [delta, setDelta] = useState({ value: 0, pct: 0 })
  const [tokens, setTokens] = useState<{
    a: Token | undefined
    b: Token | undefined
  }>({ a: undefined, b: undefined })
  const [historicalData, setHistoricalData] = useState<HSPoolLiquidity[]>([])
  const isLightMode = theme === 'Light'
  const style = makeStyle(isLightMode)

  useEffect(() => {
    const getData = async () => {
      const { pools } = GlobalDex.getState()
      // const pool = await getPoolById(poolId)
      const pool = pools.find((p) => p.poolAddr === poolId)
      if (pool && pool.tokAId && pool.tokBId) {
        const tokA = getTokenById(pool.tokAId)
        const tokB = getTokenById(pool.tokBId)
        setTokens({ a: tokA, b: tokB })
        const { data: res } = await getPoolHistoricalData(String(pool.poolAddr))
        setHistoricalData(res)
      }
    }

    getData()
  }, [poolId])

  const [exchangeData, currentRate] = useMemo(() => {
    if (tokens.a && tokens.b) {
      const parsed = parseExchangeRateData(
        tokens.a,
        tokens.b,
        historicalData,
        isLightMode,
        flip,
        LINE_CHART_TENSION,
        false,
      )
      let current
      try {
        // eslint-disable-next-line prefer-destructuring
        const dataset1 = parsed.datasets[0].data
        current = dataset1[dataset1.length - 1]
      } catch (e) {
        return [undefined, undefined]
      }
      return [parsed, current]
    }
    return [undefined, undefined]
  }, [historicalData, tokens.a, tokens.b, flip])

  const amountTokens = useMemo(() => {
    if (tokens.a && tokens.b) {
      return parseTokenAmountData(
        tokens.a,
        tokens.b,
        historicalData,
        flip,
        LINE_CHART_TENSION,
      )
    }
    return undefined
  }, [historicalData, tokens.a, tokens.b, flip])

  const [aprData, currentApr] = useMemo(() => {
    const parsed = parseAprData(historicalData, LINE_CHART_TENSION)
    let current
    try {
      // eslint-disable-next-line prefer-destructuring
      const dataset1 = parsed.datasets[0].data
      current = dataset1[dataset1.length - 1]
    } catch (e) {
      return [undefined, undefined]
    }
    return [parsed, current]
  }, [historicalData, flip])

  const currentValueMap = useMemo<{
    [i in DatasourceType]: number | undefined
  }>(
    () => ({
      price: currentRate,
      apr: currentApr,
      tvl: undefined,
    }),
    [currentRate, currentApr],
  )
  const customTooltip = useCallback(
    (context: any) => {
      if (context.tooltip.opacity === 0) {
        setTooltipVisible(false)
        setDeltaVisible(false)
        return
      }

      const chart =
        dataview === 'line' ? lineChartRef.current : barChartRef.current
      // @ts-ignore
      const { canvas } = chart
      if (canvas) {
        setTooltipVisible(true)
        setDeltaVisible(true)

        const left: number = context.tooltip.caretX
        const top = context.tooltip.caretY
        if (tooltipPos?.left !== left || tooltipPos?.top !== top) {
          const biasX =
            left + 80 > containerSize.width ? -40 : left < 80 ? 40 : 0
          const biasY = top < 120 ? 172 : 0
          setTooltipPos({ top, left, biasX, biasY })
          const ttdps = context.tooltip.dataPoints[0]

          setTooltipData({
            label: ttdps.label,
            value: Number(ttdps.raw).toFixed(2),
          })
          if (datasource === 'price' || datasource === 'apr') {
            const compareValue = Number(ttdps.raw) || undefined
            const [value, pct] = getDeltaValues(
              currentValueMap[datasource],
              compareValue,
            )
            setDelta({ value, pct })
          }
        }
      }
    },
    [tooltipPos.top, tooltipPos.left, currentRate, datasource, dataview],
  )

  const dataSetMap = useMemo<{
    [i in DatasourceType]:
      | {
          labels: string[]
          datasets: {
            id: number
            label: string
            data: number[]
            borderColor: string
            backgroundColor: string
          }[]
        }
      | undefined
  }>(
    () => ({
      price: exchangeData,
      apr: aprData,
      tvl: amountTokens,
    }),
    [exchangeData, amountTokens, aprData],
  )

  useLayoutEffect(() => {
    if (upperTooltipRef.current) {
      let fontSize = 30
      let overflow = isOverflown(upperTooltipRef.current)

      while (overflow) {
        fontSize -= 1
        upperTooltipRef.current.style.fontSize = `${fontSize}px`
        overflow = isOverflown(upperTooltipRef.current)
      }
    }
  }, [upperTooltipRef.current, tooltipVisible])

  const dataSet = dataSetMap[datasource]
  if (!tokens.a || !tokens.b || !exchangeData || !amountTokens) {
    return null
  }

  const [firstTok, secondTok] = flip
    ? [tokens.b, tokens.a]
    : [tokens.a, tokens.b]

  return (
    <Container ref={ref}>
      <TopSection>
        <SymbolSection>
          <CryptoIconPair
            firstTokId={firstTok.id}
            secondTokId={secondTok.id}
            firstTokSymbol={firstTok.symbol}
            secondTokSymbol={secondTok.symbol}
          />
          <Symbol
            data-testid={`pool-${firstTok.name}-${secondTok.name}-symbol`}
          >
            {firstTok.symbol}
            <VerifiedBadge verifyStatus={firstTok.verificationTier} />
            {' / '}
            {secondTok.symbol}
            <VerifiedBadge verifyStatus={secondTok.verificationTier} />
          </Symbol>
          <IconButtonWrapper
            onClick={() => setFlip(!flip)}
            disabled={datasource === 'apr'}
          >
            <FlipArrowsIcon />
          </IconButtonWrapper>
        </SymbolSection>
        <DataSourceContainer>
          {Object.keys(labelMap).map((k) => (
            <DatasourceButton
              key={k}
              onClick={() => setDatasource(k as DatasourceType)}
              selected={k === (datasource as string)}
              light={isLightMode}
            >
              <span>{labelMap[k as DatasourceType]}</span>
            </DatasourceButton>
          ))}
        </DataSourceContainer>
        <ModalButtonWrapper>
          <ModeButtonSection>
            <IconButtonWrapper onClick={() => setDataview('line')}>
              <LineChartIcon
                className={dataview === 'line' ? 'selected' : ''}
              />
            </IconButtonWrapper>
            <IconButtonWrapper onClick={() => setDataview('bar')}>
              <BarChartIcon className={dataview === 'bar' ? 'selected' : ''} />
            </IconButtonWrapper>
          </ModeButtonSection>
        </ModalButtonWrapper>
      </TopSection>
      <SecondTopSection>
        {(datasource === 'price' || datasource === 'apr') && (
          <CurrentValueSection>
            <Value>
              {currentValueMap[datasource]?.toFixed(2)}
              {datasource === 'apr' && '%'}
            </Value>
            {deltaVisible && (
              <DeltaValue positive={delta.value >= 0}>
                {`${delta.value >= 0 ? '+' : ''}${delta.value.toFixed(
                  2,
                )} (${delta.pct.toFixed(2)}%)`}{' '}
              </DeltaValue>
            )}
          </CurrentValueSection>
        )}
      </SecondTopSection>
      {dataview === 'line' && dataSet && (
        <LineChart
          ref={lineChartRef}
          id='swap-line-chart'
          data={dataSet}
          options={{
            ...makeViewOptions('line'),
            plugins: {
              tooltip: {
                enabled: false,
                position: 'nearest',
                external: customTooltip,
              },
              legend: {
                display: datasource === 'tvl',
              },
            },
          }}
          style={style}
        />
      )}
      {dataview === 'bar' && dataSet && (
        <BarChart
          ref={barChartRef}
          id='swap-line-chart'
          data={dataSet}
          options={{
            ...makeViewOptions('bar'),
            plugins: {
              tooltip: {
                enabled: false,
                position: 'nearest',
                external: customTooltip,
              },
              legend: {
                display: datasource === 'tvl',
              },
            },
          }}
          style={style}
        />
      )}
      {tooltipVisible && tooltipData && (
        <>
          <CustomTooltip
            top={tooltipPos.top + tooltipPos.biasY}
            left={tooltipPos.left + tooltipPos.biasX}
          >
            <UpperCustomtooltip ref={upperTooltipRef}>
              {tooltipData.value}
              {datasource === 'apr' && '%'}
            </UpperCustomtooltip>
            <LowerCustomTooltip>{tooltipData.label}</LowerCustomTooltip>
          </CustomTooltip>
          <ChartLine
            top={tooltipPos.biasY !== 0 ? tooltipPos.top + 46 : tooltipPos.top}
            left={tooltipPos.left}
          />
        </>
      )}
    </Container>
  )
}

export default PoolHistoryChart
