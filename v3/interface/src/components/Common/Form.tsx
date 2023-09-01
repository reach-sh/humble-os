import { ComponentPropsWithRef, ReactText } from 'react'
import styled, { css } from 'styled-components'
import { COLORS } from 'theme'
import { GridContainer } from './FlexContainer'

export const commonInputStyles = css`
  border: 1px solid ${({ theme }) => theme.colors.inputInactiveBorder};
  background-color: ${({ theme }) => theme.colors.inputInactiveBg};
  outline: none;
  &:focus {
    border: 1px solid ${({ theme }) => theme.colors.inputActiveBorder};
    background-color: ${({ theme }) => theme.colors.inputActiveBg};
  }
  &[aria-invalid]:not([aria-invalid='false']),
  &:invalid:not([invalid='false']) {
    border: 1px solid ${({ theme }) => theme.colors.inputErrorBorder};
    background-color: ${({ theme }) => theme.colors.inputErrorBg};
  }
`
const inputStyles = css`
  ${commonInputStyles}
  border-radius: 4px;
  font-size: 14px;

  @media screen and (max-width: 768px) {
    font-size: 16px;
  }
`
export const Input = styled.input<ComponentPropsWithRef<'input'>>`
  ${inputStyles}
  color: ${({ theme }) => theme.colors.text};
  height: ${({ type }) => (type === 'checkbox' ? '16px' : '30px')};
  margin-right: ${({ type }) => (type === 'checkbox' ? '0.5rem' : 0)};
  padding: ${({ theme }: any) => theme.sizes.xs};
  width: ${({ type }) => (type === 'checkbox' ? '16px' : '100%')};

  &:disabled,
  &:read-only,
  &[aria-disabled] {
    border: 2px solid ${COLORS.midGray} !important;
    cursor: not-allowed;
  }

  &[aria-invalid]:not([aria-invalid='false']),
  &:invalid:not([invalid='false']) {
    border-color: ${({ theme }) => theme.colors.error};
  }
`
export const styledInputStyles = css`
  background-color: ${({ theme }) =>
    theme.colors.popoverBg === COLORS.darkCream
      ? COLORS.white
      : theme.colors.popoverBg};
  border: 1px solid ${COLORS.darkSage};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text};
  min-height: 2.4rem;
  padding: 0.6rem 0.4rem;
  width: 100%;
  &:focus-visible {
    border: 1px solid ${COLORS.darkSage};
    outline: none;
  }
`
export const StyledInput = styled(Input)`
  ${styledInputStyles}
`
type LabelProps = ComponentPropsWithRef<'label'> & { column?: boolean }
export const Label = styled.label<LabelProps>`
  align-items: center;
  display: flex;
  flex-direction: ${({ column }) => (column ? 'column' : 'row')};
`
export const ColumnLabel = styled(Label).attrs({ column: true })`
  align-items: flex-start;
  gap: 6px;
`
type VGapSize = ('sm' | 'md' | 'lg') & string
export const Break = styled.hr<{ size?: VGapSize }>`
  border: 0;
  height: 0.01rem;
  background-color: transparent;
  margin: ${({ theme, size = 'sm' }) => theme.sizes[size]} 0;
`
export const LabelHeading = styled.h3`
  display: block;
  font-size: 20px;
  line-height: 2.2rem;
  margin-top: 1.6rem;
  margin-bottom: 0.2rem;
`
type SelectProps = ComponentPropsWithRef<'select'> & {
  options: any[]
  itemText(d: any): ReactText
  itemValue(d: any): ReactText
}
const SelectContainer = styled.select`
  ${inputStyles}
`
export const Select = styled((props: SelectProps) => {
  const {
    options: data,
    itemValue,
    itemText,
    onChange,
    placeholder = 'Select an Item:',
    ...rest
  } = props
  return (
    <SelectContainer disabled={!data.length} onInput={onChange} {...rest}>
      {data.length > 0 && <option value='null'>{placeholder}</option>}
      {data.map((d, i) => (
        <option key={i} value={itemValue(d)}>
          {itemText(d)}
        </option>
      ))}
      {data.length === 0 && <option value='null'>No items to display</option>}
    </SelectContainer>
  )
})``
export const Form = styled.form`
  margin: ${({ theme }) => theme.sizes.md} 0;
  max-width: 480px;
  width: 100%;

  > * {
    text-align: left;
  }
`
export const FormRow = styled(GridContainer)`
  place-content: space-between;
  gap: 0;

  @media screen and (max-width: 570px) {
    grid-template-columns: 100%;
  }
`
