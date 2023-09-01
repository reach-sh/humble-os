import SIZE from 'constants/screenSizes'
import styled from 'styled-components'
import { COLORS } from 'theme'

type FlexProps = { rounded?: boolean; width?: number; inline?: boolean }
const FlexContainer = styled.div<FlexProps>`
  align-items: center;
  border-radius: ${({ rounded }) => (rounded ? '4px' : 0)};
  display: ${({ inline }) => (inline ? 'inline-' : '')}flex;
`

/** All-purpose "Flex" container (to minimize "display:flex" repitition) */
export default FlexContainer

/** All-purpose flex column container */
export const FlexColumnContainer = styled(FlexContainer)`
  flex-direction: column;

  > * {
    width: 100%;
  }
`

type GridContainerProps = { rounded?: boolean; columns?: string }
export const GridContainer = styled.div<GridContainerProps>`
  align-items: center;
  border-radius: ${({ rounded }) => (rounded ? '4px' : 0)};
  display: grid;
  place-content: space-between;

  grid-template-columns: ${({ columns = 'auto auto' }) => columns};
`

export const CollapsibleGrid = styled(GridContainer)`
  gap: 0.75rem;
  grid-template-columns: ${({ columns = '65% 35%' }) => columns};

  @media screen and (max-width: ${SIZE.sm}) {
    grid-template-columns: 100%;
    width: 100%;
  }
`

export const ActionStep = styled(GridContainer)`
  background-color: ${({ theme }) => theme.colors.lighterBackground};
  border-radius: 10px;
  border: 1px solid ${COLORS.sage};
  color: ${({ theme }) => theme.colors.text};
  gap: 9px;
  height: 56px;
  padding: 0 11px;
  place-content: center;
  width: 100%;
`
