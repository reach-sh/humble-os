import { getBlockchain } from '@reach-sh/humble-sdk'
import Card from 'components/Common/Card'
import SIZE from 'constants/screenSizes'
import useScreenSize from 'hooks/useScreenSize'
import { DateTime } from 'luxon'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { COLORS } from 'theme'
import CryptoIconPair from './Common/CryptoIconPair'
import { ExLinkWithIcon } from './Common/ExternalLink'

/* Maintain visual parity with `PageContainer` elements */
const GovContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr;
  margin: 2rem auto -2rem;

  > b {
    display: block;
  }

  .gray-text {
    color: ${COLORS.midGray};
  }

  @media screen and (max-width: ${SIZE.xlg}) {
    display: block;
    > b {
      display: none;
    }
  }
`
const Contents = styled(Card)`
  animation: fade-in 0.3s ease-out;
  z-index: 10;

  > div {
    align-items: center;
    background-color: ${COLORS.darkCream};
    box-shadow: 0 0 1px ${COLORS.darkGray};
    color: ${COLORS.black};
    display: grid;
    gap: 1.2rem;
    grid-template-columns: max-content auto;
    max-width: 44.5rem;
    padding: 1rem;
    place-content: space-evenly;
  }

  @media screen and (max-width: ${SIZE.xlg}) {
    > div {
      margin: 0 auto;
    }
  }

  @media screen and (max-width: ${SIZE.md}) {
    > div {
    }
  }
`
const now = DateTime.now()
const ALGO_GOV_ENROLL_MONTH = [1, 4, 7, 10].includes(now.month)
const ALGO_GOV_ENROLL_WEEKS = now.day <= 14
export const ALGO_GOV_ENROLL_LIVE =
  ALGO_GOV_ENROLL_MONTH && ALGO_GOV_ENROLL_WEEKS
export const ALGO_ENROLL_ENDS = now.set({ day: 14 })
export const ALGO_GOV_URL = 'https://governance.algorand.foundation/'

const GovernanceNotification = () => {
  const { width } = useScreenSize()
  return ALGO_GOV_ENROLL_LIVE ? (
    <GovContainer>
      {width > 1440 && <b /> /* emulate `PageContainer` layout */}

      <Contents>
        <CryptoIconPair
          size={24}
          firstTokId='0'
          firstTokSymbol={getBlockchain()}
          secondTokId='-1'
          secondTokSymbol='⚠️'
        />

        <p>
          Commit eligible Humble LP to&nbsp;
          <ExLinkWithIcon href={ALGO_GOV_URL}>
            Algorand Governance
          </ExLinkWithIcon>
          or signup as an <Link to='/xgovs'>xGov</Link> to earn additional
          APR!&nbsp;
          <wbr />
          <span className='gray-text'>
            Enrollment ends on&nbsp;
            {ALGO_ENROLL_ENDS.toFormat('LLL. dd, yyyy')}
          </span>
        </p>
      </Contents>

      {width > 1440 && <b /> /* emulate `PageContainer` layout */}
    </GovContainer>
  ) : (
    <></>
  )
}

export default GovernanceNotification
