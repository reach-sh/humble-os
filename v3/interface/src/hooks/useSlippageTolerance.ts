import { setSlippage } from '@reach-sh/humble-sdk'
import { LOCAL_STORAGE_SLIPPAGE_KEY } from 'constants/local-storage'
import { useEffect, useState, useRef } from 'react'
import { GlobalUser } from 'state/reducers/user'

export default function useSlippageTolerance() {
  const DEFAULT_SLIPPAGE = 0.5
  const cachedSlippage = localStorage.getItem(LOCAL_STORAGE_SLIPPAGE_KEY)
  const fmtCachedSlippage = cachedSlippage && Number(cachedSlippage)
  const initialSlippage = fmtCachedSlippage || DEFAULT_SLIPPAGE
  const presets = [0.1, 0.5, 1]
  const minSlippage = 0.01
  const [tolerance, setTolerance] = useState(initialSlippage)
  const [custom, setCustom] = useState(
    fmtCachedSlippage && !presets.includes(fmtCachedSlippage)
      ? cachedSlippage
      : '',
  )
  const customRef = useRef(custom)
  const toleranceRef = useRef(tolerance)
  const [errorMessage, setErrorMessage] = useState('')

  const cacheTolerance = (s: number) => {
    if (s < 0) return
    const t = Math.min(s, 99)
    setTolerance(t)
    setCustom('')
    localStorage.setItem(LOCAL_STORAGE_SLIPPAGE_KEY, t.toString())
    const newTolerance = Number(t)
    GlobalUser.slippageTolerance(newTolerance)
    setSlippage(newTolerance)
  }

  const setCustomTolerance = (t: string) => {
    setCustom(t)
    // this just makes it so none of the buttons are highlighted.
    setTolerance(Number(t))
    if (Number(t) > 50) {
      setErrorMessage('Slippage can not be higher than 50%')
    } else if (Number(t) <= 0) {
      setErrorMessage('Slippage can not be less than or equal to zero.')
    } else {
      setErrorMessage('')
    }
  }

  const onBlur = () => {
    // Need to use the ref in case
    // this is called on unmount.
    const ref =
      customRef.current !== ''
        ? customRef.current
        : toleranceRef.current.toString()
    if (Number(ref) > 50) {
      resetTolerance(presets[1])
    } else if (Number(ref) > presets[0] && Number(ref) <= 50) {
      localStorage.setItem(LOCAL_STORAGE_SLIPPAGE_KEY, ref)
      GlobalUser.slippageTolerance(Number(ref))
      setSlippage(Number(ref))
    } else if (Number(ref) <= minSlippage) {
      resetTolerance(minSlippage)
    }
  }

  const resetTolerance = (n: number) => {
    setCustom('')
    setTolerance(n)
    setErrorMessage('')
    localStorage.setItem(LOCAL_STORAGE_SLIPPAGE_KEY, n.toString())
    GlobalUser.slippageTolerance(n)
    setSlippage(n)
  }

  const isButtonActive = (t: number) => tolerance === t

  const isCustomActive = custom !== ''

  const selectText = (tgt: any) => tgt.select()

  const isError = errorMessage !== ''

  // onBlur needs the tolerance value
  // on unmount in case custom is empty.
  useEffect(() => {
    toleranceRef.current = tolerance
  }, [tolerance])

  // updates the ref on every change.
  useEffect(() => {
    customRef.current = custom
  }, [custom])

  // call onBlur on unmount in the event
  // that users input a value and then
  // just click outside the container immediately.
  // onBlur won't be called in that case.
  useEffect(
    () => () => {
      onBlur()
    },
    [],
  )

  return {
    cacheTolerance,
    errorMessage,
    custom,
    presets,
    isButtonActive,
    isCustomActive,
    selectText,
    isError,
    onBlur,
    setCustomTolerance,
  }
}
