import React from 'react'
import styled from 'styled-components'
import { FlexColumnContainer } from './FlexContainer'

/** `ListView` component props */
export type ListViewProps<T> = {
  /** List item data */
  data: T[]
  className?: string
  direction?: 'row' | 'column'
  /** Called to render each list-item element */
  itemText: (d: T, i?: number) => string | number | JSX.Element
  itemClass?: (d: T) => string | undefined
  onItemClick?: (d: T) => unknown | void
  /** don't wrap list items in an extra element when `true` */
  unwrapChildren?: boolean | undefined
  /** cypress e2e testing element selector */
  testId?: string
}

/** Styled Component Export */
const ListViewWrapper = styled(FlexColumnContainer)`
  padding: 0;
  align-items: center;

  &,
  > * {
    place-content: flex-start;
  }

  > * {
    padding: 0 0.2rem;

    > .footer,
    > .title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &.list--row {
    flex-direction: row;
  }

  &:not(.list--row) li {
    width: 100%;
  }

  &:not(ol) {
    list-style: none;
  }
`
const noOp = () => undefined
/**
 * `ListView` for displaying a vertical or horizontal, ordered or unordered list of items
 */
const ListView = styled((props: ListViewProps<any>): JSX.Element => {
  // Container Props
  const {
    onItemClick,
    itemClass = noOp,
    itemText,
    className,
    direction,
    data,
    unwrapChildren = false,
  } = props
  const defaultClassNames = ['list', className || '']
  if (direction === 'row') defaultClassNames.push('list--row')
  const classNames = defaultClassNames.join(' ').trim()

  // List Item children
  const children = data.map((item: unknown, i: number) => {
    if (unwrapChildren) return itemText(item, i)
    const $attrs: any = { key: i, className: itemClass(item) }
    if (onItemClick) {
      $attrs.role = 'button'
      $attrs.tabIndex = -10 + i
      $attrs.onClick = () => onItemClick(item)
    } else $attrs.role = 'listitem'

    return (
      <div role='listitem' {...$attrs}>
        {itemText(item, i)}
      </div>
    )
  })

  // Return an ordered or unordered list
  return (
    <ListViewWrapper
      role='list'
      data-testid={props.testId || 'list-view'}
      className={classNames}
    >
      {children}
    </ListViewWrapper>
  )
})``
export default ListView
