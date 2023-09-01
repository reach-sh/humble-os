import IconButton from '@mui/material/IconButton'
import styled from 'styled-components'

const IconButtonWrapper = styled(IconButton)`
  color: ${({ theme }) => theme.colors.text};
  &[disabled],
  &:disabled,
  &.MuiButtonBase-root.Mui-disabled {
    cursor: not-allowed;
    pointer-events: none;
    opacity: 0.6;
  }

  &.MuiButtonBase-root {
    padding: 0;
    .material-icons {
      font-size: 16px;
    }
  }

  &:not(:disabled):hover .material-icons {
    animation: rotate90 ease-out 300ms, rotate90 ease-out 300ms 300ms reverse;
    animation-iteration-count: 1;
  }

  &:not(:disabled):hover img {
    animation: rotate90 ease-out 300ms, rotate90 ease-out 300ms 300ms reverse;
    animation-iteration-count: 1;
  }
`

export default IconButtonWrapper
