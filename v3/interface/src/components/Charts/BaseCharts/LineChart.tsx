import { ForwardedRef, forwardRef } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  ScatterDataPoint,
} from 'chart.js'
import { ChartJSOrUndefined } from 'react-chartjs-2/dist/types'
import { ChartContainer } from 'components/Charts/shared'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
)

export interface LineProps {
  id: string
  options: ChartOptions<'line'>
  data: ChartData<'line'>
  style?: { [index: string]: string }
}

const LineChart = forwardRef(
  (
    props: LineProps,
    ref?: ForwardedRef<
      ChartJSOrUndefined<'line', (number | ScatterDataPoint | null)[], unknown>
    >,
  ) => {
    const { id, data, options, style } = props

    return (
      <ChartContainer>
        <Line
          ref={ref}
          datasetIdKey={id}
          data={data}
          style={style || { backgroundColor: 'white' }}
          options={options}
        />
      </ChartContainer>
    )
  },
)

export default LineChart
