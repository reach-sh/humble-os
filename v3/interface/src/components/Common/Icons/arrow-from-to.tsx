import { ArrowProps, StyledPathFill, StyledPathStroke } from './arrow'

const ArrowFromTo = ({
  className,
  height = '16',
  viewBox = '0 0 16 16',
  width = '16',
  ...props
}: ArrowProps) => (
  <svg
    className={className}
    width={width}
    height={height}
    viewBox={viewBox}
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <StyledPathFill
      // eslint-disable-next-line max-len
      d='M4.53033 9.46967C4.23744 9.17678 3.76256 9.17678 3.46967 9.46967C3.17678 9.76256 3.17678 10.2374 3.46967 10.5303L4.53033 9.46967ZM8 14L7.46967 14.5303L8 15.0607L8.53033 14.5303L8 14ZM12.5303 10.5303C12.8232 10.2374 12.8232 9.76256 12.5303 9.46967C12.2374 9.17678 11.7626 9.17678 11.4697 9.46967L12.5303 10.5303ZM3.46967 10.5303L7.46967 14.5303L8.53033 13.4697L4.53033 9.46967L3.46967 10.5303ZM8.53033 14.5303L12.5303 10.5303L11.4697 9.46967L7.46967 13.4697L8.53033 14.5303Z'
      containerClassName={className}
    />
    <StyledPathStroke
      d='M8 14L8 2'
      strokeWidth={1.5}
      strokeLinecap='round'
      containerClassName={className}
    />
  </svg>
)

export default ArrowFromTo
