import SIZE from 'constants/screenSizes'
import styled from 'styled-components'
import { COLORS } from 'theme'
import LoadingSkeleton from 'components/Common/LoadingSkeleton'
import { useIsMobile } from 'hooks/useScreenSize'
import FlexContainer from 'components/Common/FlexContainer'
import FarmGrid from './FarmGrid'
import ItemDetails from './ItemDetails'

const ListItemBorder = styled.div`
  border: ${`1px solid ${COLORS.white}`};
  border-radius: 8px;
  margin-bottom: 8px;
  p {
    font-size: 16px;
    line-height: 19px;
    @media (max-width: ${SIZE.sm}) {
      font-size: 12px;
      line-height: 14px;
    }
  }
`

const ListItem = styled(FarmGrid)`
  padding: 0.5rem 0.5rem;
  border-radius: 8px;
  align-items: flex-start;
  transition: all 0.05s;
`

const TotalReward = styled(ItemDetails)`
  cursor: pointer;
  overflow: visible;
`

const ItemTitle = styled.div`
  display: flex;
`

const Icons = styled(FlexContainer)`
  margin: 0 4px;
  flex-direction: row;
  @media (max-width: ${SIZE.sm}) {
    flex-direction: column;
  }
`

const ExpandButtonCell = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: flex-end;
`

const FarmTableItemSkeleton = () => {
  const isMobile = useIsMobile()
  return (
    <ListItemBorder>
      <ListItem>
        <div>
          <ItemTitle>
            <Icons>
              {['0', '1'].map((t) => (
                <LoadingSkeleton key={t} loading circle radius={20} />
              ))}
            </Icons>
            <Icons>
              <LoadingSkeleton
                loading
                width={isMobile ? 30 : 118}
                height={18}
                borderRadius={9}
              />
              <LoadingSkeleton
                loading
                width={isMobile ? 57 : 18}
                height={18}
                borderRadius={9}
              />
            </Icons>
          </ItemTitle>
          {!isMobile && (
            <LoadingSkeleton loading width={200} height={16} borderRadius={8} />
          )}
        </div>

        <TotalReward>
          <LoadingSkeleton loading width={52} height={18} borderRadius={9} />
          <LoadingSkeleton loading width={83} height={16} borderRadius={8} />
        </TotalReward>

        <ItemDetails>
          <LoadingSkeleton loading width={70} height={16} borderRadius={8} />
          <LoadingSkeleton loading width={17} height={16} borderRadius={3} />
        </ItemDetails>

        <ItemDetails>
          <LoadingSkeleton loading width={80} height={18} borderRadius={9} />
          <LoadingSkeleton loading width={63} height={16} borderRadius={8} />
        </ItemDetails>
        <ExpandButtonCell>
          <LoadingSkeleton loading circle radius={14} />
        </ExpandButtonCell>
      </ListItem>
    </ListItemBorder>
  )
}

export default FarmTableItemSkeleton
