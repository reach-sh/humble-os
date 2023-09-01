import styled from 'styled-components'
import { ExLinkWithIcon } from './Common/ExternalLink'
import ListView, { ListViewProps } from './Common/ListView'

export const HelpLinks = styled(ListView)<ListViewProps<any>>`
  animation: scale-in 250ms ease-out;
  background-color: ${({ theme }) => theme.colors.accent};
  transform-origin: bottom right;
  bottom: 3.25rem;
  padding: ${({ theme }) => theme.sizes.md};
  position: absolute;
  width: 320px;
  border-radius: 12px;
`
export const HelpLink = styled(ExLinkWithIcon)`
  align-items: center;
  background: #191713;
  border-radius: 12px;
  color: #fff;
  display: inline-flex;
  margin: 0.6rem 0;
  padding: ${({ theme }) => `${theme.sizes.xs} ${theme.sizes.md}`};
  place-content: space-between;
  pointer-events: all;
  width: 100%;

  &:hover {
    animation: pulse 0.45s ease-in-out;
  }

  .material-icons {
    font-size: ${({ theme }) => theme.sizes.md};
  }
`
