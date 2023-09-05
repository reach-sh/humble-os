import styled from 'styled-components'
import ExternalLinkIcon from 'assets/external-link.svg'

const Icon = styled.img`
  width: 23px;
  position: relative;
  top: 5px;
`
const PopoutIcon = () => <Icon alt='' src={ExternalLinkIcon} />

export default PopoutIcon
