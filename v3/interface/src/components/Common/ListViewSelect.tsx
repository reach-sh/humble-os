import { noOp } from '@reach-sh/humble-sdk'
import useBlur from 'hooks/useBlur'
import { ComponentPropsWithRef, useRef, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from 'theme'
import Button from './Button'
import { ButtonProps } from './Button.props'
import ListView, { ListViewProps } from './ListView'

const { milk, white, midGray, sage } = COLORS
type SelectButtonProps = ButtonProps & { border?: boolean }
const SelectButton = styled(Button).attrs({
  size: 'sm',
  type: 'button',
  variant: 'link',
})<SelectButtonProps>`
  border-color: ${({ border }) => (border ? sage : 'transparent')};
  border-radius: 8px;
  border-style: solid;
  border-width: ${({ border }) => (border ? '1px' : 0)};
  color: ${({ theme }) => theme.colors.text};
  font-weight: bold;
  padding: 0.6rem 0.2rem 0.6rem 0.8rem;
  width: 100%;

  .material-icons {
    font-size: 1.3rem;
    margin-left: 0.2rem;
  }
`

type FloatingListProps = ListViewProps<any> & {
  offsetTop?: string
  offsetLeft?: string
  offsetRight?: string
  offsetBottom?: string
}
const FloatingListView = styled(ListView)<FloatingListProps>`
  background-color: ${({ theme }) => theme.colors.background};
  bottom: ${({ offsetBottom = 'auto' }) => offsetBottom};
  left: ${({ offsetLeft = '0' }) => offsetLeft};
  position: absolute;
  right: ${({ offsetRight = 'auto' }) => offsetRight};
  top: ${({ offsetTop = '0' }) => offsetTop};
  z-index: 99;

  > * {
    border-bottom: 1px dotted ${({ theme }) => theme.colors.border};
    cursor: pointer;
    padding: 0 1rem;
    line-height: 2rem;

    &:hover {
      color: ${midGray};
      border-color: ${midGray};
    }

    &:last-of-type {
      border: 0;
    }
  }
`

const SelectContainer = styled.div`
  background-color: ${({ theme }) =>
    theme.colors.background === milk ? white : '#000'};
  border-radius: 8px;
  margin: 0;
  padding: 0;
  min-width: 120px;

  ${FloatingListView} {
    border: 1px solid ${({ theme }) => theme.colors.lighterBackground};
    width: 100%;
  }
`

type ListViewSelectProps<T> = ListViewProps<T> &
  ComponentPropsWithRef<'select'> & { border?: boolean }

/** An expandable `ListView` that can be visually used as a `<select />` element */
export const ListViewSelect = styled((props: ListViewSelectProps<any>) => {
  const { border, value, itemText, onItemClick = noOp } = props
  const testId = props.testId || 'select-options-button'
  const listTestId = `${testId}-options`
  const $containerRef = useRef<HTMLDivElement>(null)
  const [expanded, expand] = useState(false)
  const toggleSelecting = () => expand(!expanded)
  const onSelect = (d: any) => {
    expand(false)
    onItemClick(d)
  }

  useBlur($containerRef, () => expand(false))

  return (
    <SelectContainer ref={$containerRef}>
      <SelectButton
        border={border}
        data-testid={testId}
        rightIcon='expand_more'
        onClick={toggleSelecting}
      >
        {itemText(value)}
      </SelectButton>

      {expanded && (
        <FloatingListView
          {...props}
          testId={listTestId}
          offsetTop='40px'
          onItemClick={onSelect}
        />
      )}
    </SelectContainer>
  )
})``

export default ListViewSelect
