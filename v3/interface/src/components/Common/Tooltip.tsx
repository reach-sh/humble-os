import React, {
  useEffect,
  useRef,
  ComponentPropsWithRef,
  ReactNode,
} from 'react'
import styled from 'styled-components'
import InfoIcon from 'assets/Icons/question.svg'
import SIZE from 'constants/screenSizes'
import ExternalLinkIcon from './ExternalLink'

const Info = styled.img`
  margin-left: 6px;
  filter: ${({ theme }) => theme.svgFilter};
`

const Content = styled.span.attrs({ className: 'tooltiptext' })`
  left: auto;
  margin-left: auto;
  top: 0.25rem;
  right: 1.9rem;
`
const Body = styled.div`
  align-items: center;
  display: flex;
`
type AlignProps = { alignItems?: 'center' | 'flex-start' | 'flex-end' }
const ContainerGeneral = styled.div<AlignProps>`
  display: flex;
  flex-direction: column;
  align-items: ${({ alignItems }) => alignItems || 'center'};
  justify-content: center;
  a {
    font-weight: bold;
    color: #6c9688;
    &:hover {
      text-decoration: underline;
    }
    img {
      width: 18px;
    }
  }

  &:hover span,
  .tooltipbridge {
    &,
    &:hover {
      visibility: visible;
    }
  }
`

const ContainerLeft = styled.div.attrs({ className: 'tooltip' })<AlignProps>`
  overflow: visible;
  z-index: 5;

  p {
    font-size: smaller;
  }

  .tooltipbridge {
    border: 8px solid transparent;
    border-left-color: ${({ theme }) => theme.colors.darkButtonBg};
    right: 1rem;
  }

  .tooltipbridge,
  .tooltiptext {
    left: auto;
    margin-left: auto;
  }

  .tooltiptext {
    width: 200px;
    bottom: initial;
  }
`
interface ToolTipTextProps {
  position?: 'top' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottom'
  size: 'small' | 'medium' | 'large'
}

const ToolTipText = styled.span<ToolTipTextProps>`
  visibility: hidden;
  text-align: center;
  max-width: 320px;
  width: ${({ size }) =>
    size === 'large' ? 288 : size === 'medium' ? 216 : 144}px;
  background-color: ${({ theme }) => theme.colors.toolTipBackground};
  color: #ffffff;
  border-radius: 8px;
  padding: 8px 16px;

  /* Position the tooltip */
  position: absolute;
  z-index: 2;
  bottom: 10px;
  left: 50%;
  font-weight: 600;
  font-size: 14px;
  margin-left: ${({ position }) =>
    position === 'topLeft' ? '-250px' : '-106px'};
  @media (max-width: ${SIZE.sm}) {
    width: ${({ size }) =>
      size === 'large' ? 240 : size === 'medium' ? 216 : 144}px;
  }
`

const ToolTipBridge = styled.span`
  position: absolute;
  width: 0;
  height: 0;
  visibility: hidden;
  border-left: 11px solid transparent;
  border-right: 11px solid transparent;
  border-top: 11px solid ${({ theme }) => theme.colors.toolTipBackground};
  bottom: 3px;
  margin-left: -7px;
`

const Tooltip = (
  props: {
    disable?: boolean
    size?: 'small' | 'medium' | 'large'
    icon?: string
    link?: string
    linkMessage?: string
    content?: ReactNode
    message?: string
    position?: 'top' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottom'
    alignItems?: 'center' | 'flex-start' | 'flex-end'
  } & ComponentPropsWithRef<'div'>,
) => {
  const toolTipText = useRef<any>()
  const {
    children,
    icon,
    link,
    content,
    linkMessage,
    message,
    position,
    alignItems,
    disable = false,
    size = 'large',
  } = props
  const isChildNull = (childrenComponent: ReactNode) =>
    !React.Children.count(childrenComponent)
  useEffect(() => {
    if (
      content !== undefined ||
      toolTipText === undefined ||
      toolTipText.current === undefined
    )
      return
    const tooltipPosition = toolTipText.current.getBoundingClientRect()
    const defaultMarginLeft = -106
    const padding = 10
    if (tooltipPosition.right > window.innerWidth)
      toolTipText.current.style.marginLeft = `${
        defaultMarginLeft -
        (tooltipPosition.right - window.innerWidth + padding)
      }px`
    if (tooltipPosition.left < 0)
      toolTipText.current.style.marginLeft = `${
        defaultMarginLeft + (Math.abs(tooltipPosition.left) + padding)
      }px`
  }, [toolTipText])

  const Container = position === 'left' ? ContainerLeft : ContainerGeneral
  return (
    <Container alignItems={alignItems}>
      {!disable &&
        (content === undefined ? (
          <div>
            <ToolTipText ref={toolTipText} position={position} size={size}>
              {message}{' '}
              {link && linkMessage && (
                <a
                  href={link}
                  target='_blank'
                  rel='noopener noreferrer nofollow'
                >
                  {linkMessage}
                  <ExternalLinkIcon />
                </a>
              )}
            </ToolTipText>
            <ToolTipBridge />
          </div>
        ) : (
          <div>
            <Content>{content}</Content>
            <span className='tooltipbridge' />
          </div>
        ))}
      {isChildNull(children) ? (
        <Info src={icon || InfoIcon} />
      ) : (
        <Body>{children}</Body>
      )}
    </Container>
  )
}

export default Tooltip
