import { Link } from 'react-router-dom'
import { paths } from 'App.routes'
import Card from 'components/Common/Card'
import PageContainer from 'components/PageContainer'
import fishiesLightMode from 'assets/swap_illustration_light_mode.png'
import fishiesDarkMode from 'assets/swap_illustration_dark_mode.png'
import { useTheme } from 'contexts/theme'
import ImageLoader from 'components/Common/ImageLoader'
import styled from 'styled-components'

const PageContent = styled(Card)`
  text-align: center;
  place-content: center;

  .fishes {
    animation: spin 64s linear reverse infinite;
  }
`

const NotFound = () => {
  const isDarkTheme = useTheme().theme === 'Dark'
  const emptyImage = isDarkTheme ? fishiesDarkMode : fishiesLightMode
  return (
    <PageContainer type='pool'>
      <PageContent title='Not found' padded>
        <p>The page you are looking for may have moved, or been removed.</p>
        <ImageLoader className='fishes' width={300} src={emptyImage} />
        <p>It may have also never existed! 😲</p>
        <Link to={paths.pool.index}>
          Return to <b>Pools</b>
        </Link>
      </PageContent>
    </PageContainer>
  )
}

export default NotFound
