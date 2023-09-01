import { MOBILE_SCREEN_THRESHOLD } from 'constants/screenSizes'
import { useEffect, useState } from 'react'

const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState<{
    height: number
    width: number
  }>({
    height: window.innerHeight,
    width: window.innerWidth,
  })

  function handleWindowSizeChange() {
    setScreenSize({
      height: window.innerHeight,
      width: window.innerWidth,
    })
  }

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange)
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange)
    }
  }, [])

  return screenSize
}

export const useIsMobile = () => {
  const screenSize = useScreenSize()
  return screenSize.width <= MOBILE_SCREEN_THRESHOLD
}

export default useScreenSize
