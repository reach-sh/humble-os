import { ChangeEvent, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from 'theme'
import ChevronIcon from 'components/Common/Icons/chevron'
import { blockInvalidChar } from 'utils/input'
import SIZE from 'constants/screenSizes'
import { currencyDisplayUnit, currencyDisplaySymbol } from 'prices'

const BoxContainer = styled.div`
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.boxBorder};
  max-width: 420px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  gap: 4px;
`

const RowContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
  > div:last-of-type {
    overflow: hidden;
    span:first-child {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`

const ColContainer = styled(RowContainer)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`

// TODO: consolidate this input modal with the one in the PairCard
const AmountInput = styled.input`
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font-size: 24px;
  font-weight: bold;
  line-height: 29px;
  text-align: right;
  width: 100%;
  &:focus {
    outline: none;
  }
  &::placeholder {
    color: #9ca2aa;
  }
  @media (max-width: ${SIZE.sm}) {
    font-size: 21px;
  }
`

const RewardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Span = styled.span<{
  fontSize?: number
  fontWeight?: number
}>`
  color: ${({ theme }) => theme.colors.textAlt};
  font-size: ${({ fontSize }) => fontSize || '32'}px;
  font-weight: ${({ fontWeight }) => fontWeight || '700'};
  text-align: right;
  height: '22px';
  line-height: '22px';
`

interface AmountBoxProps {
  amount: string
  onInputChange?: (e: ChangeEvent<HTMLInputElement>) => void
  symbol: string
}

export const AmountBox = ({
  amount,
  onInputChange = () => null,
  symbol,
}: AmountBoxProps) => (
  <>
    <BoxContainer>
      <RowContainer>
        <AmountInput
          inputMode='decimal'
          onChange={(e) => onInputChange(e)}
          onKeyDown={(e) => blockInvalidChar(e, amount)}
          placeholder='0.00'
          style={{
            cursor: 'inhe2it',
            borderBottom: 'none',
          }}
          type='text'
          value={amount}
        />
        <Span fontSize={16} fontWeight={400}>
          {symbol}
        </Span>
      </RowContainer>
    </BoxContainer>
  </>
)

interface RewardsBoxProps {
  rewards: string[][]
  symbols: string[]
}

export const RewardsBox = ({ rewards, symbols }: RewardsBoxProps) => (
  <BoxContainer>
    <RewardContainer>
      {rewards.map((reward, i) =>
        reward.length && reward[0] !== '0' ? (
          <div key={`reward-${i}`}>
            <ColContainer data-testid={`reward-${i}`}>
              <AmountInput
                inputMode='decimal'
                disabled
                placeholder='0.00'
                style={{
                  cursor: 'inherit',
                  borderBottom: 'none',
                }}
                type='text'
                value={reward[0]}
              />
              <Span fontSize={20} fontWeight={400}>
                {symbols[i]}
              </Span>
            </ColContainer>
            <ColContainer data-testid={`reward-${i}-default-currency`}>
              <AmountInput
                inputMode='decimal'
                disabled
                placeholder='0.00'
                style={{
                  cursor: 'inherit',
                  borderBottom: 'none',
                  fontSize: 14,
                  fontWeight: 400,
                  height: '22px', // NOTE: height and lineHeight to center text vertically
                  lineHeight: '22px',
                }}
                type='text'
                value={reward[1]}
              />
              <Span fontSize={14} fontWeight={400}>
                {currencyDisplaySymbol(currencyDisplayUnit())}
              </Span>
            </ColContainer>
          </div>
        ) : null,
      )}
    </RewardContainer>
  </BoxContainer>
)
const DetailsButton = styled.button`
  align-items: center;
  background-color: transparent;
  border: none;
  color: ${COLORS.darkSage};
  cursor: pointer;
  display: flex;
  font-size: 12px;
  font-weight: 800;
  gap: 6px;
  height: 32px;
  justify-content: center;
  margin-top: 24px;
  &:focus-visible {
    outline: 1px solid ${COLORS.darkSage};
  }
`

const DetailsText = styled.div`
  margin-top: 24px;
  &:first {
    margin-top: 0px;
  }
`

export const DetailsBox = () => {
  const [show, setShow] = useState(false)

  return (
    <>
      <DetailsButton type='button' onClick={() => setShow((s) => !s)}>
        Details
        <ChevronIcon className={show ? 'rotate' : 'rotate-reverse'} />
      </DetailsButton>
      {show && (
        <>
          <DetailsText className='slide-down-fade-in'>
            {`🏆 TVL: Rewards are shared amongst all participants. If more users
            join the farm, your reward will decrease proportionately to your
            share of the pool.`}
          </DetailsText>
          <DetailsText className='slide-down-fade-in'>
            {`For example, if you start out with 10% of the
            pool, you'll be receiving 10% of each block's rewards. If more users
            join the pool and you're now 1% of the pool, you'll now receive only
            1% of each blocks rewards.`}
          </DetailsText>
          <DetailsText className='slide-down-fade-in'>
            {`🕒 Time: Rewards are emitted every block for 60 days. If you join at
            day 59, you'll only receive rewards for 1 day's worth of blocks.`}
          </DetailsText>
        </>
      )}
    </>
  )
}
