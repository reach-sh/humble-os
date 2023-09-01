import React, { ReactElement, ReactNode } from 'react'
import { noOp } from '@reach-sh/humble-sdk'
import { t } from '@lingui/macro'
import Dialog from '@mui/material/Dialog'
import styled from 'styled-components'
import closeIcon from 'assets/Icons/Close.svg'
import { useTheme } from 'contexts/theme'
import SIZE from 'constants/screenSizes'
import Button, { CancelButton, WideButton } from '../Common/Button'
import FlexContainer, {
  FlexColumnContainer,
  GridContainer,
} from '../Common/FlexContainer'
import RotateIconButton from '../Common/RotateIconButton'

const ModalHeader = styled(FlexContainer)<{ sticky: boolean }>`
  flex-direction: column;
`

const RotateIconContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
`

const ModalControls = styled(GridContainer)<{ hideCancelBtn?: boolean }>`
  grid-template-columns: ${({ hideCancelBtn }) =>
    hideCancelBtn ? '100%' : 'repeat(2, calc(50% - 4px))'};
  gap: 8px;
  position: sticky;
  bottom: 0;
  max-width: 480px;
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => `${theme.sizes.sm} 24px`};
`

const Title = styled.h1`
  font-size: 1.4rem;
  line-height: 1.4rem;
`
// We add a bit more padding to the top if there is no
// close button so it still looks normal.
const ModalContents = styled(FlexColumnContainer)<{ kind: Kind }>`
  border-radius: 16px;
  color: ${({ theme }) => theme.colors.text};
  height: auto;
  padding: ${({ theme }) => theme.sizes.sm};
  padding-top: ${({ kind, theme }) => kind === 'noClose' && theme.sizes.lg};

  ${WideButton}, ${CancelButton} {
    flex-grow: 1;
    min-width: 50%;
  }
`

const StyledDialog = styled(Dialog)<{ width?: number; background?: string }>`
  & .MuiPaper-rounded {
    border-radius: 16px;
  }
  & .MuiDialog-paperWidthSm {
    max-width: ${({ width }) => (width ? `${width}px` : '420px')};
    background: ${({ theme, background }) =>
      background || theme.colors.background};
    width: 100%;
  }

  & .MuiPaper-elevation24 {
    box-shadow: ${({ theme }) => theme.shadows.default};
  }

  @media screen and (max-width: ${SIZE.xs}) {
    .MuiPaper-rounded {
      margin-left: 0;
      margin-right: 0;
    }
  }
`

type Kind = 'close' | 'noClose'

type ButtonChildren =
  | string
  | number
  | (React.ReactElement<any, string | React.JSXElementConstructor<any>> &
      ReactNode)

type CommonProps = React.ComponentPropsWithRef<'div'> & {
  modalTitle?: string | number | ReactNode | ReactElement<any, any>
  confirmationText?: string
  cancellationText?: string
  hideCancelBtn?: boolean
  children: ButtonChildren
  open: boolean
  onConfirm?: () => void
  width?: number
  confirmDisabled?: boolean
  sticky?: boolean
  background?: string
  zIndex?: number
}

type ModalCloseProps = CommonProps & {
  kind?: 'close'
  onClose: () => void
}

type ModalNoCloseProps = CommonProps & {
  kind?: 'noClose'
}

type ModalProps = ModalCloseProps | ModalNoCloseProps

function isModalClose(props: ModalProps): props is ModalCloseProps {
  // kind could be 'close' or undefined in the case of
  // 'close', so easier to check if it's not 'noClose'
  return props.kind !== 'noClose'
}

const ModalComponent = (props: ModalProps) => {
  const { theme } = useTheme()

  const {
    modalTitle: title,
    confirmationText = t`Confirm`,
    cancellationText = t`Cancel`,
    hideCancelBtn,
    onConfirm = noOp,
    children,
    width,
    confirmDisabled = false,
    open = false,
    sticky = true,
    kind = 'close',
    background,
  } = props

  // check if we are passing in onClose and run it if so.
  const runOnClose = () =>
    isModalClose(props)
      ? // eslint-disable-next-line react/destructuring-assignment
        props.onClose()
      : noOp // return an empty function otherwise.

  return (
    <StyledDialog
      style={{ zIndex: props?.zIndex ?? 9999 }} //  show wc2 modal
      width={width}
      open={open}
      onClose={runOnClose}
      background={background}
    >
      {open && (
        <ModalContents kind={kind}>
          <ModalHeader sticky={sticky}>
            {kind === 'close' && (
              <RotateIconContainer>
                <RotateIconButton
                  customIcon={closeIcon}
                  onClick={runOnClose}
                  filter={
                    theme === 'Dark'
                      ? 'dark-sage-svg-filter'
                      : 'light-mode-svg-filter'
                  }
                />
              </RotateIconContainer>
            )}
            <Title data-testid='modal-title'>{title || ''}</Title>
          </ModalHeader>

          {children}

          {onConfirm !== noOp && (
            <ModalControls hideCancelBtn={hideCancelBtn}>
              {hideCancelBtn || (
                <Button
                  data-testid='modal-cancel'
                  variant='cancel'
                  onClick={runOnClose}
                  size='lg'
                >
                  {cancellationText}
                </Button>
              )}

              <Button
                disabled={confirmDisabled}
                data-testid='modal-confirm'
                onClick={onConfirm}
                size='lg'
              >
                {confirmationText}
              </Button>
            </ModalControls>
          )}
        </ModalContents>
      )}
    </StyledDialog>
  )
}

export default ModalComponent
