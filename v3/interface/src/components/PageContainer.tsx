import styled from 'styled-components'
import SIZE from 'constants/screenSizes'
import { useTheme } from 'contexts/theme'
import leftFishDark from 'assets/left-fish-dark.svg'
import rightFishDark from 'assets/right-fish-dark.svg'
import leftFishLight from 'assets/left-fish-light.svg'
import rightFishLight from 'assets/right-fish-light.svg'
import diverDark from 'assets/diver_dark.png'
import diverLight from 'assets/diver_light.png'
import chest from 'assets/empty_box_dark_mode.png'
import TutorialCard from './Common/TutorialCard'
import ImageLoader from './Common/ImageLoader'

const PageContainerWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr;
  min-height: 80vh;
  padding-top: 2rem;

  @media (max-width: ${SIZE.xlg}) {
    display: block;
    max-width: 100vw;
  }
  @media (min-width: ${SIZE.xlg}) {
    min-height: 100vh;
  }
`

const PageContent = styled.div`
  max-width: 45rem;
  min-height: 75vh;
  padding: 2rem 0.25rem;
  grid-column: 2 / 3;

  @media (max-width: ${SIZE.xlg}) {
    margin: 0 auto;
    width: 100%;
  }
`
const ImageWrapper = styled.div`
  align-items: end;
  display: grid;
  grid-template-columns: 1fr;
  max-height: ${SIZE.sm};
  place-content: end;

  img {
    margin: 0 auto;
    max-width: 368px;
  }

  @media (max-width: ${SIZE.xlg}) {
    display: none;
  }
`

type PageProps = {
  type: 'swap' | 'limitOrder' | 'pool' | 'farm'
  children: React.ReactNode
  hasTutorial?: boolean
}

// NOTE: Change images here for following tickets
const imageMap = {
  Light: {
    swap: {
      left: leftFishLight,
      right: rightFishLight,
    },
    pool: {
      left: chest,
      right: diverLight,
    },
    farm: {
      left: leftFishLight,
      right: rightFishLight,
    },
    limitOrder: {
      left: leftFishLight,
      right: rightFishLight,
    },
  },
  Dark: {
    swap: {
      left: leftFishDark,
      right: rightFishDark,
    },
    pool: {
      left: chest,
      right: diverDark,
    },
    farm: {
      left: leftFishDark,
      right: rightFishDark,
    },
    limitOrder: {
      left: leftFishDark,
      right: rightFishDark,
    },
  },
}

// TODO: Make the fishes here
/**
 * Global Page container for all main page components
 */
const PageContainer = ({ type, children, hasTutorial }: PageProps) => {
  const { theme } = useTheme()

  const { left, right } = imageMap[theme][type]

  return (
    <PageContainerWrapper>
      {hasTutorial && <TutorialCard />}
      {left && (
        <ImageWrapper>
          <ImageLoader width='100%' src={left} />
        </ImageWrapper>
      )}
      <PageContent>{children}</PageContent>
      {right && (
        <ImageWrapper>
          <ImageLoader width='100%' src={right} />
        </ImageWrapper>
      )}
    </PageContainerWrapper>
  )
}

export default PageContainer
