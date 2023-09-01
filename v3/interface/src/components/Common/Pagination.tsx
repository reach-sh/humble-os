import styled from 'styled-components'
import SIZE from 'constants/screenSizes'
import FlexContainer from 'components/Common/FlexContainer'
import { useTheme } from 'contexts/theme'
import arrowLeft from 'assets/Icons/arrow-left.svg'
import arrowRight from 'assets/Icons/arrow-right.svg'
import { COLORS } from 'theme'

const PaginationContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 5px;
  button {
    @media (max-width: ${SIZE.sm}) {
      display: none;
    }
  }
`

const PageContainer = styled.div`
  display: inline-flex;
  justify-content: center;
  align-items: center;
`

const PageButton = styled.div`
  font-weight: bold;
`

const IconImg = styled.img``

const PageButtonWrapper = styled(FlexContainer).attrs({ inline: true })`
  width: 2rem;
  height: 2rem;
  padding: 10px;
  margin: 5px;
  justify-content: center;
  border-radius: 100%;
  &.selected {
    background-color: ${({ theme }) => theme.colors.main};
    color: ${COLORS.black};
  }
  &:hover:not(.truncate) {
    cursor: pointer;
    border: 1px solid ${({ theme }) => theme.colors.main};
  }
`

const Pagination = ({
  pagesLength,
  onPageClick,
  currentPage,
  pageSize = 5,
}: {
  pagesLength: number
  onPageClick: (currentPage: number) => void
  currentPage: number
  pageSize: number
}) => {
  const { theme } = useTheme()
  const themeFilter =
    theme === 'Dark' ? 'dark-mode-svg-filter' : 'light-mode-svg-filter'

  if (pagesLength <= pageSize) return null
  const handlePageClick = (page: number) => {
    onPageClick(page)
  }

  const previousPage = () => {
    onPageClick(Math.max(currentPage - 1, 0))
  }

  const nextPage = () => {
    const max = Math.ceil(pagesLength / pageSize) - 1
    onPageClick(Math.min(max, currentPage + 1))
  }

  const createPageArray = () => {
    const max = Math.ceil(pagesLength / pageSize)
    const pageArray: any = Array.from(
      Array(Math.ceil(pagesLength / pageSize)).keys(),
    )
    if (max > 7) {
      if (currentPage < 3) {
        return [...pageArray.slice(0, 5), '...', max - 1]
      }
      if (currentPage > max - 4) {
        return [0, '...', ...pageArray.slice(max - 5, max)]
      }
      return [
        0,
        '...',
        ...pageArray.slice(currentPage - 1, currentPage + 2),
        '...',
        max - 1,
      ]
    }
    return pageArray
  }

  return (
    <PaginationContainer>
      <PageButtonWrapper onClick={previousPage}>
        <IconImg src={arrowLeft} className={themeFilter} />
      </PageButtonWrapper>
      <PageContainer>
        {createPageArray().map((e: string | number, i: number) =>
          typeof e === 'string' ? (
            <PageButtonWrapper key={i} className='truncate'>
              <PageButton>{e}</PageButton>
            </PageButtonWrapper>
          ) : (
            <PageButtonWrapper
              key={i}
              className={e === currentPage ? 'selected' : ''}
              onClick={() => handlePageClick(Number(e))}
            >
              <PageButton>{Number(e) + 1}</PageButton>
            </PageButtonWrapper>
          ),
        )}
      </PageContainer>
      <PageButtonWrapper onClick={nextPage}>
        <IconImg src={arrowRight} className={themeFilter} />
      </PageButtonWrapper>
    </PaginationContainer>
  )
}

export default Pagination
