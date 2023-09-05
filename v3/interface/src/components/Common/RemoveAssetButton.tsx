import styled from 'styled-components'
import Button from 'components/Common/Button'
import { COLORS } from 'theme'
import cacheReducer from 'state/cacheReducer'
import { ButtonProps } from './Button.props'
import Icon from './Icon'

const Container = styled(Button)`
  background: transparent;
  color: ${COLORS.midGray};
  height: 40px;
  min-width: 40px;
  padding: 0;
  width: 40px;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
  .content,
  .material-icons-outlined {
    line-height: initial;
    font-size: 1.2rem;
  }
`
type RemoveAssetProps = ButtonProps & {
  assetId?: any
}
const RemoveAssetButton = styled((props: RemoveAssetProps) => {
  const { assetId: id, disabled } = props
  const handleDelete = (e: any) => {
    if (!id) return
    e.preventDefault()
    e.stopPropagation()
    cacheReducer.tokens.delete(id)
  }

  return (
    <Container onClick={handleDelete} disabled={disabled}>
      <Icon outlined iconType='delete' />
    </Container>
  )
})``

export default RemoveAssetButton
