import styled, { css } from 'styled-components'
import { COLORS } from 'theme'
import Button from 'components/Common/Button'
import FlexContainer, {
  FlexColumnContainer,
  GridContainer,
} from 'components/Common/FlexContainer'
import SIZE from 'constants/screenSizes'
import LoadingSkeleton from 'components/Common/LoadingSkeleton'
import ItemDetails from './ItemDetails'

export const ListItemDropdown = styled(GridContainer)`
  border-top: ${({ theme }) => `1px solid ${theme.colors.border}`};
  grid-template-columns: 9rem 1fr;
  grid-template-rows: 1fr;

  @media (max-width: ${SIZE.sm}) {
    grid-template-columns: 1fr;
    margin-bottom: 0;
    padding-bottom: 0.4rem;
    order: 1;
  }
`
export const DropdownDetails = styled(GridContainer)`
  align-items: stretch;
  background: ${({ theme }) => theme.colors.farmInfoBackground};
  border-radius: 8px;
  border: ${({ theme }) => `1px solid ${theme.colors.border}`};
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 1fr;
  margin-top: -1px;

  > * {
    padding: 1.1rem 0.9rem;
  }

  @media (max-width: ${SIZE.sm}) {
    grid-template-columns: repeat(1, 100%);
    order: 1;
  }
`
export const DropdownLinks = styled(FlexColumnContainer).attrs({
  inline: true,
})`
  align-self: stretch;
  margin-left: 0.8rem;
  justify-content: center;
  a {
    color: ${COLORS.darkSage};
    font-size: 12px;
    line-height: 14px;

    &:hover {
      text-decoration: underline;
    }
  }

  @media (max-width: ${SIZE.sm}) {
    align-self: unset;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin-left: 0;
    margin-top: 1rem;
    order: 2;

    a {
      display: block;
      padding: 0.5rem;

      > img {
        display: none;
      }
    }
  }
`
export const RewardsLayout = styled(FlexContainer)`
  background: ${({ theme }) => theme.colors.body};
  border-radius: 0.75rem;
  margin: 4px 0px;
  padding: 0px 4px;

  > * {
    flex: 1;
  }

  @media (max-width: ${SIZE.sm}) {
    align-items: start;
    flex-direction: column;

    > * {
      padding: 0.2rem 0;
    }
  }
`
export const ButtonLayout = styled(FlexContainer)`
  justify-content: space-between;

  > button {
    flex: 1;
    &:nth-child(2) {
      background-color: ${({ theme }) => theme.colors.unstakeButton};
      color: ${COLORS.white};
      margin-left: 15px;
    }
  }

  @media (max-width: ${SIZE.sm}) {
    align-self: start;
    flex-direction: column;

    > button:nth-child(2) {
      margin-left: 0;
    }
  }
`
export const RewardText = styled(FlexContainer)`
  img {
    transform: scale(0.8);
    margin-right: 0.3rem;
  }
`
const SmallButton = styled(Button).attrs({ size: 'sm' })`
  background-color: ${({ theme }) => theme.colors.accent};
  cursor: pointer;
  font-size: 12px;
  height: 22px;
  margin-bottom: 0.8rem;
  transition: opacity 0.1s;
  width: 80px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.accent};
    opacity: 0.8;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.disabledButton};
    opacity: 0.7;
  }
`
export const ClaimButton = styled(SmallButton).attrs({ variant: 'accent' })``
export const StakeButton = styled(SmallButton)`
  &:hover {
    color: ${({ theme }) => theme.colors.textHover};
    background-color: ${({ theme }) => theme.colors.accent};
  }

  &:disabled {
    color: #19171399;
    background-color: ${({ theme }) => theme.colors.disabledButton};
  }
`
export const ExtLink = styled.a.attrs({
  target: '_blank',
  rel: 'noopener noreferrer nofollow',
})``
export const StakedDetails = styled(ItemDetails)`
  font-size: 20px;
`
export const CopyButtonContainer = styled.div`
  align-self: flex-start;
  display: flex;
  margin-top: 8px;
  width: auto;

  @media (max-width: ${SIZE.sm}) {
    grid-column: 1 / end;
    button {
      margin: 0 0.5rem;
      place-content: center;
      width: 100%;
    }
  }
`
export const CopyButton = styled.button`
  align-items: center;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  display: flex;
  font-size: 10px;
  width: auto;
  &:focus-visible {
    outline: none;
  }
`
export const TitleLabel = styled.label`
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
`
export const NoteMsg = styled.div`
  font-size: 12px;
`
export const DisplayRewardContainer = styled.div`
  cursor: pointer;

  &,
  [class^='Body-'] {
    width: 100%;
  }

  > * {
    align-items: start;
  }

  [class^='Body-'] {
    display: block;
    width: 100%;
  }
`
const smallBtnLayout = css`
  align-items: start;
  flex-direction: column;
  padding-top: 0.45rem;
  width: 8rem;

  button {
    display: block;
    margin-left: 0;
    width: 100%;
  }
`
export const StakedDetailsLoading = styled(LoadingSkeleton)``
export const StakedButtonLayout = styled(ButtonLayout)``
export const AvailableRewards = styled(FlexColumnContainer)`
  @media (max-width: ${SIZE.sm}) {
    display: grid;
    gap: 0.4rem;
    grid-template-columns: auto 8rem;
    grid-template-areas:
      'label    label'
      'rewards  actions';
    order: 2;

    ${TitleLabel} {
      grid-area: label;
    }
    ${RewardsLayout} {
      flex-direction: column;
      grid-area: rewards;
      width: 100%;

      > * {
        padding: 0.2rem 0;
        width: 100%;
      }
    }
    ${ButtonLayout} {
      ${smallBtnLayout}
    }
  }
`
export const StakedAmount = styled(GridContainer)`
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  grid-template-columns: repeat(1, 1fr);
  grid-template-areas:
    'label'
    'amt_staked'
    'actions'
    'note';

  ${TitleLabel} {
    grid-area: label;
  }
  ${StakedDetailsLoading} {
    grid-area: amt_staked;
  }
  ${ButtonLayout} {
    grid-area: actions;
  }
  ${NoteMsg} {
    grid-area: note;
  }
  @media (max-width: ${SIZE.sm}) {
    border-left: 0;
    border-bottom: 1px solid ${COLORS.lightGray};
    grid-template-areas:
      'label        label'
      'amt_staked   actions'
      'note         note';
    order: 1;

    ${ButtonLayout} {
      ${smallBtnLayout}
    }
  }
`
export type DisplayRewardProps = {
  connector: string
  priceUnit: string
  rewardTokenAmt: string
  rewardTokenId: string
  loading: boolean
}
