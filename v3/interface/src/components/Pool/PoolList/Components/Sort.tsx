import styled from 'styled-components'
import SortDescending from 'assets/Icons/sort_descending.svg'
import SortAscending from 'assets/Icons/sort_ascending.svg'
import { SORT_DIRECTION } from '../index'

const SortWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 0.5rem;
  cursor: pointer;
`
const SortIcon = styled.img<{ active?: boolean; darkMode?: boolean }>`
  filter: ${({ active, darkMode }) =>
    darkMode
      ? active
        ? 'brightness(5)'
        : 'brightness(3)'
      : active
      ? 'brightness(0)'
      : 'brightness(3)'};
`

export const Sort = ({
  sortDirection,
  onClick,
  isDarkMode,
}: {
  sortDirection?: string
  onClick: () => void
  isDarkMode?: boolean
}) => {
  const isSortByDescending = sortDirection === SORT_DIRECTION.DESCENDING
  const isSortByAscending = sortDirection === SORT_DIRECTION.ASCENDING
  const handleClick = () => onClick()
  return (
    <SortWrapper onClick={handleClick}>
      <SortIcon
        active={isSortByAscending}
        src={SortAscending}
        darkMode={isDarkMode}
      />
      <SortIcon
        darkMode={isDarkMode}
        active={isSortByDescending}
        style={{ marginTop: '2px' }}
        src={SortDescending}
      />
    </SortWrapper>
  )
}

export default Sort
