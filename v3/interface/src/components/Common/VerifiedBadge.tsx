import capitalize from 'lodash.capitalize'
import styled from 'styled-components'
import suspiciousIcon from '../../assets/Icons/suspicious.svg'
import trustedIcon from '../../assets/Icons/trusted.svg'
import verifiedIcon from '../../assets/Icons/verified.svg'
import Tooltip from './Tooltip'

type BadgeLayoutProps = {
  color: string
  isText: boolean
}
const BadgeLayout = styled.div<BadgeLayoutProps>`
  align-items: center;
  background-color: ${({ color }) => color};
  border-radius: 8px 0px;
  border: ${({ isText }) => (isText ? 0 : 1)}px solid white;
  cursor: pointer;
  display: flex;
  height: 17px;
  padding: 2px ${({ isText }) => (isText ? 6 : 3)}px;
`
const BadgeIcon = styled.img`
  width: 13px;
  height: 13px;
`
type BadgeLabelProps = {
  labelColor: string
}
const BadgeLabel = styled.span<BadgeLabelProps>`
  font-size: 10px;
  font-weight: 600;
  color: ${({ labelColor }) => labelColor};
`
type VerifiedBadgeProps = {
  isText?: boolean
  verifyStatus?: 'trusted' | 'verified' | 'suspicious' | 'unverified'
}

const assets = {
  trusted: ['#0B447B', '#C6E3FF', trustedIcon, 'Trusted'],
  verified: ['#234911', '#D7EBDB', verifiedIcon, 'Verified'],
  suspicious: ['#71333A', '#F9C3D0', suspiciousIcon, 'Suspicious'],
}

const VerifiedBadge = ({
  isText = false,
  verifyStatus,
}: VerifiedBadgeProps) => {
  if (!verifyStatus || verifyStatus === 'unverified') return <></>
  const [color, backgroundColor, icon, buttonLabel] = assets[verifyStatus]
  const status = `${capitalize(verifyStatus)} Token`

  return (
    <Tooltip message={status}>
      <BadgeLayout color={backgroundColor} isText={isText}>
        {isText ? (
          <BadgeLabel labelColor={color}>{buttonLabel}</BadgeLabel>
        ) : (
          <BadgeIcon src={icon} />
        )}
      </BadgeLayout>
    </Tooltip>
  )
}

export default VerifiedBadge
