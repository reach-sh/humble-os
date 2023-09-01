import * as React from 'react'
import styled from 'styled-components'
import { ArrowProps } from './arrow'

const StyledPathStroke = styled.path`
  stroke: ${({ theme }) => theme.colors.timerColor};
`
const TimerIcon = ({
  height = '17',
  viewBox = '0 0 17 17',
  width = '17',
  ...props
}: ArrowProps) => (
  <svg
    width={width}
    height={height}
    viewBox={viewBox}
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <StyledPathStroke
      d='M8.1665 4.59082V8.49988'
      stroke='#FEFDF9'
      strokeWidth={1.5}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <StyledPathStroke
      d='M11.5518 10.4545L8.1665 8.5'
      stroke='#FEFDF9'
      strokeWidth={1.5}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <StyledPathStroke
      d='M12.7427 6.19652H16.0002V2.93896'
      stroke='#FEFDF9'
      strokeWidth={1.5}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <StyledPathStroke
      // eslint-disable-next-line max-len
      d='M13.2342 13.5677C12.2319 14.5699 10.9549 15.2525 9.56475 15.529C8.17456 15.8055 6.73359 15.6636 5.42407 15.1212C4.11454 14.5788 2.99527 13.6602 2.20779 12.4817C1.42031 11.3031 1 9.91753 1 8.50011C1 7.08269 1.42031 5.6971 2.20779 4.51855C2.99527 3.34001 4.11454 2.42145 5.42407 1.87902C6.73359 1.3366 8.17456 1.19468 9.56475 1.4712C10.9549 1.74773 12.2319 2.43028 13.2342 3.43255L15.9983 6.19667'
      stroke='#FEFDF9'
      strokeWidth={1.5}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default TimerIcon
