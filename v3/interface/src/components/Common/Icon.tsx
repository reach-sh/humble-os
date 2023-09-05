import styled from 'styled-components'

type RIconBtnProps = {
  iconType: string
  outlined?: boolean
  className?: string
}

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
`

const Icon = styled(
  ({ iconType, className, outlined }: RIconBtnProps): JSX.Element => {
    const editedClassName = `${className} ${
      outlined ? 'material-icons-outlined' : 'material-icons'
    }`
    return <span className={editedClassName}>{iconType}</span>
  },
)``

export default Icon
