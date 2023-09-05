import { cryptoImage, imgSrc } from 'constants/crypto-icons'
import { useEffect, useState } from 'react'

interface CryptoIconProps {
  /**  @description Return a color image (default false) */
  color?: boolean
  /**  @description Crypto abbreviation (e.g. ETH) */
  symbol: string
  /**  @description Width and height of icon: default is `20px` */
  size?: number
  id: string | number
}

function CryptoIcon(props: CryptoIconProps) {
  const { symbol, color = true, size = 20, id } = props
  const imgProps = { width: size, height: size }
  const [image, setImage] = useState(cryptoImage(symbol, id, color))
  let errored = false

  const onError = () => {
    if (errored) return
    setImage(imgSrc('generic', color))
    errored = true
  }

  useEffect(() => {
    setImage(cryptoImage(symbol, id, color))
  }, [symbol, id, color])

  return <img {...imgProps} src={image} onError={onError} />
}

export default CryptoIcon
