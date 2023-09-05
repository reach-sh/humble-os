import React from 'react'

/**
 * Custom hook to easily capture blur events on a particular component
 * Will fire when a a blur event occurs on component
 * example:
 * import useBlur from 'hooks/useBlur'
 * const componentWrapperRef = React.useRef<HTMLHeadingElement>(null)
 * useBlur(componentWrapperRef, callBack)
 */
const useBlur = (ref: any, onBlur: (event: MouseEvent) => void) => {
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onBlur(event)
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
    // eslint-disable-next-line
  }, [ref, onBlur])
}

export default useBlur
