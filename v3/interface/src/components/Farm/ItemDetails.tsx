import SIZE from 'constants/screenSizes'
import styled, { css } from 'styled-components'

export const ItemDetails = styled.div<{ bold?: boolean; wrapText?: boolean }>`
  display: flex;
  flex-direction: column;
  font-weight: ${({ bold }) => (bold ? 'bold' : 'normal')};
  overflow: hidden;
  justify-content: center;
  align-items: center;
  text-overflow: ellipsis;
  white-space: ${({ wrapText }) => (wrapText ? 'normal' : 'nowrap')};

  > br {
    display: none;
  }

  ${({ wrapText }) =>
    wrapText &&
    css`
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    `};

  @media (max-width: ${SIZE.sm}) {
    > br {
      display: block;
    }
  }
`

export default ItemDetails
