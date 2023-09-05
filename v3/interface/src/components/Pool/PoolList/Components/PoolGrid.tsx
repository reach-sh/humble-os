import styled from 'styled-components'
import SIZE from 'constants/screenSizes'

const PoolGrid = styled.div`
  display: grid;
  grid-template-columns: 3.25rem 12rem 1.5fr repeat(3, minmax(0, 1fr));
  grid-template-rows: 28px;
  @media (max-width: ${SIZE.sm}) {
    margin-bottom: 0;
  }
`
export default PoolGrid
