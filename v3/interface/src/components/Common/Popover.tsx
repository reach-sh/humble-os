import styled from 'styled-components'
import React from 'react'
import useBlur from 'hooks/useBlur'

const PopoverContainer = styled.div<{ padding?: boolean; width?: number }>`
  background: ${({ theme }) => theme.colors.popoverBg};
  position: absolute;
  top: 3.25rem;
  z-index: 10;
  right: 0;
  box-shadow: ${({ theme }) => `${theme.colors.shadow}`};
  border: ${({ theme }) => `1px solid ${theme.colors.border}`};
  border-radius: 16px;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  width: ${({ width }) => (width ? `${width}px` : 'inherit')};
  @media (max-width: 40em) {
    top: 7rem;
    width: 100%;
    position: fixed;
  }
  > button {
    margin: 0 0 0.65rem;
    padding: 0.3rem;
  }

  > * {
    width: 100%;
  }
`
/**
 *
 * @param padding is a boolean that adds 1rem of padding if true
 * @param width is a number that is translated to a width in pixels for the drawer cotainer
 * @returns JSX Element
 */
const Popover = ({
  children,
  open,
  handleClose,
  width,
}: {
  children: React.ReactNode
  open: boolean
  handleClose: () => void
  width?: number
}) => {
  const popoverRef = React.useRef<HTMLHeadingElement>(null)
  useBlur(popoverRef, handleClose)
  if (!open) return null
  return (
    <PopoverContainer ref={popoverRef} width={width}>
      {children}
    </PopoverContainer>
  )
}

export default Popover
