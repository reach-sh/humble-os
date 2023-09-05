import { ForwardedRef, forwardRef } from 'react'
import { Bar } from 'react-chartjs-2'

import {
  Chart as ChartJS,
  CategoryScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LinearScale,
  ChartOptions,
  ChartData,
} from 'chart.js'
import { ChartContainer } from 'components/Charts/shared'
import { ChartJSOrUndefined } from 'react-chartjs-2/dist/types'

ChartJS.register(
  CategoryScale,
  PointElement,
  LinearScale,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
)
export interface BarProps {
  id: string
  options: ChartOptions<'bar'>
  data: ChartData<'bar'>
  style?: { [index: string]: string }
}

const BarChart = forwardRef(
  (
    props: BarProps,
    ref?: ForwardedRef<ChartJSOrUndefined<'bar', (number | null)[], unknown>>,
  ) => {
    const { id, data, options, style } = props

    return (
      <ChartContainer>
        <Bar
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

export default BarChart
