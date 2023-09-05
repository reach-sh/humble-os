/* eslint-disable @typescript-eslint/no-unused-vars */
import styled from 'styled-components'
import SIZE from 'constants/screenSizes'
import { COLORS } from 'theme'
import { useIsMobile } from 'hooks/useScreenSize'
import LoadingSkeleton from 'components/Common/LoadingSkeleton'
import FlexContainer from 'components/Common/FlexContainer'
import PoolGrid from './PoolGrid'

const ListItem = styled(PoolGrid)`
  align-items: center;
  padding: 0.5rem 0.5rem;
  border: ${({ theme }) => `1px solid ${theme.colors.border}`};
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.05s;
  min-height: 60px;
  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
  }
  /* mobile grid */
  @media (max-width: ${SIZE.sm}) {
    grid-template-columns: 3.6rem 0.8fr 1.2fr 1.2fr 0.8fr;
    grid-template-rows: 27px 1fr;
  }
`
const Icons = styled(FlexContainer)`
  margin: 0 4px;
  grid-column: 1 / 2;
  @media (max-width: ${SIZE.sm}) {
    grid-column: 1;
    grid-row: 1;
  }
`
const TokIds = styled.div`
  grid-row: 2;
  display: flex;
  font-size: 10px;
  grid-column: 2/3;
  color: ${COLORS.white};
  @media (max-width: ${SIZE.sm}) {
    display: none;
  }
`
const SymbolDiv = styled.div`
  grid-column: 2;
  margin-top: 20px;
  @media (max-width: ${SIZE.sm}) {
    grid-column-start: 2;
    grid-column-end: 4;
    grid-row: 1;
    margin-top: 0px;
  }
`
const Stat = styled.div<{ col: number; colMobile?: number }>`
  grid-row: 1;
  grid-column: ${({ col }) => col};
  justify-self: flex-start;
  margin-top: 0;
  margin: 0;
  text-align: left;
  width: 100%;
  @media (max-width: ${SIZE.sm}) {
    align-self: center;
    grid-column: ${({ col, colMobile }) => colMobile || col} / 4;
    grid-row: 2;
    justify-content: space-between;
    justify-self: center;
    text-align: center;
  }
`
const TVLStat = styled(Stat)`
  @media (max-width: ${SIZE.sm}) {
    width: 100%;
    grid-column-start: 1;
    grid-column-end: 3;
    display: inherit;
    justify-content: center;
  }
`
const AddWrapper = styled.div<{ col: number; colMobile?: number }>`
  grid-column: ${({ col }) => col};
  text-align: right;
  @media (max-width: ${SIZE.sm}) {
    grid-row: 1;
    grid-column: ${({ col, colMobile }) => colMobile || col};
  }
`
const PoolListItemSkeleton = () => {
  const isMobile = useIsMobile()
  if (isMobile) {
    return (
      <ListItem>
        <Icons>
          {['0', '1'].map((t) => (
            <LoadingSkeleton key={t} loading circle radius={20} />
          ))}
        </Icons>
        <SymbolDiv>
          <LoadingSkeleton loading width={150} height={16} borderRadius={8} />
        </SymbolDiv>
        <TVLStat col={3} colMobile={2}>
          <LoadingSkeleton loading width={90} height={18} borderRadius={9} />
          <LoadingSkeleton loading width={60} height={18} borderRadius={9} />
        </TVLStat>
        <Stat col={4} colMobile={3}>
          <LoadingSkeleton loading width={60} height={18} borderRadius={9} />
          <LoadingSkeleton loading width={50} height={18} borderRadius={9} />
        </Stat>
        <Stat col={5} colMobile={4}>
          <LoadingSkeleton loading width={60} height={18} borderRadius={9} />
          <LoadingSkeleton loading width={50} height={18} borderRadius={9} />
        </Stat>
        <AddWrapper col={6} colMobile={5}>
          <LoadingSkeleton loading width={60} height={18} borderRadius={4} />
        </AddWrapper>
      </ListItem>
    )
  }
  return (
    <ListItem>
      <Icons>
        {['0', '1'].map((t) => (
          <LoadingSkeleton key={t} loading circle radius={20} />
        ))}
      </Icons>
      <SymbolDiv>
        <LoadingSkeleton loading width={150} height={16} borderRadius={8} />
        <TokIds>
          <LoadingSkeleton loading width={60} height={16} borderRadius={3} />
          <LoadingSkeleton
            loading
            width={60}
            height={16}
            borderRadius={3}
            style={{ marginLeft: '10px' }}
          />
        </TokIds>
      </SymbolDiv>
      <LoadingSkeleton loading width={90} height={18} borderRadius={9} />
      <LoadingSkeleton loading width={60} height={18} borderRadius={9} />
      <LoadingSkeleton loading width={60} height={18} borderRadius={9} />
      <LoadingSkeleton loading width={60} height={18} borderRadius={4} />
    </ListItem>
  )
}

export default PoolListItemSkeleton
