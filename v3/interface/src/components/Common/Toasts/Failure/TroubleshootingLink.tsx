import PopoutIcon from 'components/Common/PopoutIcon'
import { HUMBLE_SWAP_TROUBLESHOOTING } from 'constants/links'
import styled from 'styled-components'

const StyledLink = styled.a`
  color: #6c9688;
  font-weight: 800;
  font-style: normal;
  margin-left: 1em;
  &:hover {
    text-decoration: underline;
  }
`

const TroubleshootingLink = () => (
  <StyledLink
    rel='noopener noreferrer'
    target='_blank'
    href={HUMBLE_SWAP_TROUBLESHOOTING}
  >
    View troubleshooting tips <PopoutIcon />
  </StyledLink>
)

export default TroubleshootingLink
