import * as React from 'react'
import { ArrowProps } from './arrow'

const WyreLogo = ({
  height = 34,
  width = 38,
  viewBox = '0 0 38 34',
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
    <rect
      width={Number(width) - 1}
      height={height}
      rx={3.95349}
      fill='#191713'
    />
    <path
      // eslint-disable-next-line max-len
      d='M20.3656 17H26.9362L23.393 25.6786C22.8997 26.8895 21.7336 27.6744 20.4329 27.6744H13.8623L17.4055 18.9958C17.8989 17.7625 19.065 17 20.3656 17Z'
      fill='white'
    />
    <path
      // eslint-disable-next-line max-len
      d='M26.935 17L22.9433 22.0681C22.3379 22.8754 21.4184 23.3912 20.342 23.3912H15.5654L17.3819 18.9734C17.8752 17.7849 19.0413 17 20.342 17H26.935Z'
      fill='#191713'
    />
    <path
      // eslint-disable-next-line max-len
      d='M18.1664 11.6628H24.737L21.1938 20.3414C20.7005 21.5523 19.5344 22.3372 18.2337 22.3372H11.6631L15.2063 13.6586C15.6996 12.4477 16.8882 11.6628 18.1664 11.6628Z'
      fill='white'
    />
    <path
      // eslint-disable-next-line max-len
      d='M24.7593 11.6628L20.7676 16.7309C20.1621 17.5382 19.2426 18.054 18.1662 18.054H13.3896L15.2061 13.6362C15.6995 12.4477 16.8656 11.6628 18.1662 11.6628H24.7593Z'
      fill='#191713'
    />
    <path
      // eslint-disable-next-line max-len
      d='M15.9916 6.32556H22.5622L19.019 15.0041C18.5257 16.2151 17.3596 17 16.0589 17H9.48828L13.0315 8.32141C13.5248 7.11044 14.6909 6.32556 15.9916 6.32556Z'
      fill='white'
    />
  </svg>
)

export default WyreLogo
