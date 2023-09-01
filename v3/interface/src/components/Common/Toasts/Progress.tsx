import { ToastProps } from 'types/shared'
import progress from 'assets/progress.gif'
import styled from 'styled-components'

import ActionInfo from './ActionInfo'

type ImageProps = {
  src: string
}
const StyledProgressBarImage = styled.img<ImageProps>`
  background: transparent;
  margin-bottom: -2em;
  object-fit: cover;
  max-width: 420px;
  margin-left: 0.5em;
  @media only screen and (max-width: 480px) {
    width: 100%;
  }
`

const Progress = styled.div`
  margin-top: -2.125em;
  margin-left: -1em;
  display: inline-block;
`

const ProgressToast = ({
  message,
  info,
  className,
}: ToastProps): JSX.Element => (
  <div className={className}>
    {info ? (
      <ActionInfo message={message} info={info} />
    ) : (
      <ActionInfo message={message} />
    )}
    <Progress>
      <StyledProgressBarImage src={progress} />
    </Progress>
  </div>
)
export default styled(ProgressToast).attrs({})`
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: block;
  .action-info {
    color: ${({ theme }) => theme.colors.actionInfoText};
  }
`
