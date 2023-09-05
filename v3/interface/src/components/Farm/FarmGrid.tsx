import SIZE from 'constants/screenSizes'
import styled from 'styled-components'

const ListGrid = styled.div`
  display: grid;
  grid-template-columns: 14rem repeat(3, minmax(0, 1fr)) 3rem;
  grid-template-rows: 1fr;
  @media (max-width: ${SIZE.sm}) {
    grid-template-columns: minmax(0, 1fr) repeat(3, minmax(0, 1fr)) 1rem;
    margin-bottom: 0;
  }
`

export default ListGrid
