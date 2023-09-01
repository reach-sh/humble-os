import { useState, useEffect } from 'react'
import { COLORS } from 'theme'
import CircleProgressBar from './CircleProgressBar'

const Countdown = ({
  duration,
  tooltip,
  onCountDownZero,
}: {
  duration: number
  tooltip?: string
  onCountDownZero: () => void
}) => {
  const [progress, setProgress] = useState(0)
  const step = 100 / duration

  useEffect(() => {
    onCountDownZero()
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          onCountDownZero()
          return step
        }
        return prevProgress + step
      })
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  const handleResetClick = () => {
    onCountDownZero()
    setProgress(0)
  }

  return (
    <CircleProgressBar
      progress={progress}
      size={16}
      strokeWidth={1.5}
      circleTwoStroke={COLORS.white}
      bgRect={COLORS.sage}
      tooltip={tooltip}
      onClick={handleResetClick}
    />
  )
}

export default Countdown
