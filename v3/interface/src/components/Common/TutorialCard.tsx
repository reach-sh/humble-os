import styled from 'styled-components'
import { COLORS } from 'theme'
import TutCardIllustration from 'assets/tutCardIllustration.png'
import { HUMBLE_SWAP_FAQ, HUMBLE_SWAP_SUPPORT } from 'constants/links'

const TutorialCardWrapper = styled.div`
  display: none; // not showing for now
  width: 100%;
  border: 1px solid black;
  border-radius: 16px;
  padding: 8px;
  align-self: flex-start;
  @media (max-width: 1400px) {
    display: none;
  }

  > p:first-of-type {
    margin-top: 32px;
    font-weight: bold;
    font-size: 24px;
    line-height: 29px;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.text};
  }
  > p:last-of-type {
    margin-top: 24px;
    font-weight: normal;
    font-size: 16px;
    line-height: 20px;
    > a {
      font-weight: bold;
      color: ${COLORS.darkSage};
      &:hover {
        text-decoration: underline;
      }
    }
  }
`

const TitleContainer = styled.div`
  padding: 14px;
  border-radius: 16px;
  background-color: ${COLORS.orange};
  display: flex;
  align-items: center;

  > div {
    display: inline-flex;
    flex-direction: column;
    > p:first-of-type {
      font-weight: bold;
      font-size: 16px;
      line-height: 20px;
      text-transform: uppercase;
      color: ${({ theme }) => theme.colors.text};
    }
    > p:last-of-type {
      font-weight: 800;
      font-size: 16px;
      color: ${({ theme }) => theme.colors.buttonText};
    }
  }
`

const TitleImage = styled.img`
  display: inline-flex;
  margin-right: 8px;
`

/**
 * Tutorial Card
 */
function TutorialCard(): JSX.Element {
  return (
    <TutorialCardWrapper>
      <TitleContainer>
        <TitleImage src={TutCardIllustration} />
        <div>
          <p>You are on the Testnet version of HumbleSwap</p>
          {/* @TODO This will be uncommented when we go to mainnet
              <p>What&apos;s Mainnet?</p> */}
        </div>
      </TitleContainer>
      <p>
        Make sure you understand all risks and benefits of a decentralized
        exchange before you begin
      </p>
      <p>
        Please be careful with your funds while making transactions. Some
        transactions might cause losses by circumstances outside of HumbleSwaps
        sphere of influence. Please review the{' '}
        <a href={HUMBLE_SWAP_FAQ} target='_blank' rel='noreferrer'>
          HumbleSwap Documentation
        </a>{' '}
        before continuing. You can also contact our{' '}
        <a href={HUMBLE_SWAP_SUPPORT} target='_blank' rel='noreferrer'>
          Customer Support
        </a>{' '}
        if if you have any questions.
      </p>
      <div>
        {/* Temporarily commenting out this styled video until we get a HumbleSwap Youtube Channel */}
        {/* <iframe
              style={{ width: '100%', aspectRatio: '16/9' }}
              src='https://www.youtube.com/embed/z1nWuxelRpE'
              title='YouTube video player'
              frameBorder='0'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
            /> */}
      </div>
    </TutorialCardWrapper>
  )
}

export default TutorialCard
