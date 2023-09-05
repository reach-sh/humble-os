import styled from 'styled-components'
import Button from 'components/Common/Button'
import { useState, MouseEvent, ComponentPropsWithRef } from 'react'
import { parseAddress } from 'reach/utils'
import { ButtonProps } from './Button.props'
import FlexContainer from './FlexContainer'
import Tooltip from './Tooltip'
import Icon from './Icon'

type TooltipHeadingProps = {
  variant?: 'main' | 'accent'
} & ComponentPropsWithRef<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'>

export const TooltipHeading = styled.h6<TooltipHeadingProps>`
  color: ${({ theme, variant = 'main' }) => theme.colors[variant]};
  margin-bottom: ${({ theme }) => theme.sizes.sm};
`
const AddButton = styled(Button).attrs({
  variant: 'accent',
  size: 'sm',
})`
  padding: ${({ theme }) => `${theme.sizes.xxs} ${theme.sizes.xs}`};
`
const Container = styled(FlexContainer)`
  color: ${({ theme }) => theme.colors.main};
  grid-column: 3/4;
  margin-left: -0.5rem;
  place-content: space-between;
  width: 96px;
`

type AddAssetProps = ButtonProps & {
  assetId?: any
  onAddToken: (id: any) => any
}

const AddCustomToken = styled((props: AddAssetProps) => {
  const { assetId: id, onAddToken } = props
  const [addingCustom, setAdding] = useState(false)
  const addCustom = async (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setAdding(true)
    onAddToken(parseAddress(id))
  }

  return (
    <Container>
      <Tooltip
        position='left'
        content={
          <div>
            <TooltipHeading>Beware of scams</TooltipHeading>
            <p>
              Confirm the token address on its project website. Token creation
              is not regulated, and anyone can create token with any name,
              including existing token names. After purchasing such a token, you
              might not be able to sell it back.
            </p>
          </div>
        }
      >
        <Icon iconType='warning_amber' />
      </Tooltip>
      {addingCustom ? (
        <span className='spinner--before' />
      ) : (
        <AddButton
          disabled={addingCustom}
          onClick={addCustom}
          data-testid='add-to-list'
        >
          <>Add to List</>
        </AddButton>
      )}
    </Container>
  )
})``

export default AddCustomToken
