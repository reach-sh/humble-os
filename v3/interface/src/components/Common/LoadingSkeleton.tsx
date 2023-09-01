import React, { ComponentPropsWithRef } from 'react'
import Skeleton, { SkeletonProps } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useTheme } from 'styled-components'

type TextLoadingSkeletonProps = SkeletonProps &
  ComponentPropsWithRef<'div'> & {
    text?: string
    loading: boolean
    radius?: string | number
  }

const LoadingSkeleton = ({
  text,
  loading,
  radius,
  children,
  ...props
}: TextLoadingSkeletonProps) => {
  const theme = useTheme()
  const newProps = props
  if (radius) {
    newProps.width = radius
    newProps.height = radius
  }
  if (loading)
    return (
      <Skeleton
        baseColor={theme.colors.lighterBackground}
        highlightColor={theme.colors.body}
        height={18}
        style={{ opacity: 0.6, marginBottom: '5px' }}
        {...newProps}
      />
    )
  return <>{!React.Children.count(children) ? text : children}</>
}
export default LoadingSkeleton
