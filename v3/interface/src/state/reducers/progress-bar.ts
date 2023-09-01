import createState from '@jackcom/raphsducks'
import { Store } from '@jackcom/raphsducks/lib/types'

export type ProgressBarData = {
  isActive: boolean
  message: string
  currentStep: number
  totalSteps: number
}

export type ProgressBarInstance = Store<ProgressBarData>
export type ProgressBarKeys = keyof ProgressBarData

export const initProgressState: ProgressBarData = Object.freeze({
  isActive: false,
  message: '',
  currentStep: 0,
  totalSteps: 0,
})

export const GlobalProgressBar = createState(initProgressState)
export default GlobalProgressBar

/** Set up `ProgressBar` for step sequence */
export const initProgressBar = (totalSteps: number) => {
  GlobalProgressBar.multiple({ ...initProgressState, totalSteps })
}

/**
 * Show a message from a list, using the current (global) step index in state.
 * This "moves" the state forward by a step, since `updaetProgressBar` will
 * increment the step index.
 */
export const moveProgressBar = (steps: string[]) => {
  const { currentStep } = GlobalProgressBar.getState()
  updateProgressBar(steps[currentStep])
}

/** Reset `ProgressBar` (without actually resetting the state) */
export const resetProgressBar = () =>
  GlobalProgressBar.multiple(initProgressState)

/** Update `ProgressBar` state: change notification and increment step */
export const updateProgressBar = (message: string) => {
  const { currentStep } = GlobalProgressBar.getState()
  const next = currentStep + 1
  GlobalProgressBar.multiple({ isActive: true, message, currentStep: next })
}
