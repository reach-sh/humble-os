import link from 'assets/external-link.svg'
import { ComponentPropsWithRef } from 'react'
import styled from 'styled-components'
import { COLORS } from 'theme'

const ExternalLinkIcon = styled.img.attrs(() => ({ src: link }))`
  filter: brightness(0) invert(1);
  height: auto;
  width: 16px;
`

export default ExternalLinkIcon

export const ExternalLink = styled.a`
  color: ${COLORS.darkSage};
  font-weight: bold;
`

export const ExLinkWithIcon = ({
  children,
  href,
  ...rest
}: ComponentPropsWithRef<'a'>) => (
  <ExternalLink href={href} rel='noopener noreferrer' target='_blank' {...rest}>
    {children}
    <ExternalLinkIcon />
  </ExternalLink>
)
