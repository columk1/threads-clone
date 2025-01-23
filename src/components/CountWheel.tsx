import { useEffect, useRef, useState } from 'react'

import { decideShouldRoll } from '@/utils/decideShouldRoll'
import { formatCount } from '@/utils/format/formatCount'

type CountWheelProps = {
  likeCount: number
  isLiked: boolean
  hasBeenToggled: boolean
}

const animationConfig = {
  duration: 400,
  easing: 'cubic-bezier(0, 0, 0.2, 1)',
  fill: 'forwards' as FillMode,
}

const enteringUpKeyframe = [
  { opacity: 0, transform: 'translateY(10px)' },
  { opacity: 1, transform: 'translateY(0)' },
]

const enteringDownKeyframe = [
  { opacity: 0, transform: 'translateY(-14px)' },
  { opacity: 1, transform: 'translateY(0)' },
]

const exitingUpKeyframe = [
  { opacity: 1, transform: 'translateY(0)' },
  { opacity: 0, transform: 'translateY(-10px)' },
]

const exitingDownKeyframe = [
  { opacity: 1, transform: 'translateY(0)' },
  { opacity: 0, transform: 'translateY(14px)' },
]

const CountWheel = ({ likeCount, isLiked, hasBeenToggled }: CountWheelProps) => {
  const shouldAnimate = hasBeenToggled
  const shouldRoll = decideShouldRoll(isLiked, likeCount)

  const countView = useRef<HTMLDivElement>(null)
  const prevCountView = useRef<HTMLDivElement>(null)

  const [prevCount, setPrevCount] = useState(likeCount)
  const prevIsLiked = useRef(isLiked)
  const formattedCount = formatCount(likeCount)
  const formattedPrevCount = formatCount(prevCount)

  useEffect(() => {
    if (isLiked === prevIsLiked.current) {
      return
    }

    const newPrevCount = isLiked ? likeCount - 1 : likeCount + 1
    if (shouldAnimate && shouldRoll) {
      countView.current?.animate?.(isLiked ? enteringUpKeyframe : enteringDownKeyframe, animationConfig)
      prevCountView.current?.animate?.(isLiked ? exitingUpKeyframe : exitingDownKeyframe, animationConfig)
      setPrevCount(newPrevCount)
    }
    prevIsLiked.current = isLiked
  }, [isLiked, likeCount, shouldAnimate, shouldRoll])

  if (likeCount < 1) {
    return null
  }

  return (
    <div className="relative">
      <div ref={countView}>
        {/* <span className={cx('tabular-nums', isLiked && 'text-notification')}>{formattedCount}</span> */}
        <span>{formattedCount}</span>
      </div>
      {hasBeenToggled && (likeCount > 1 || !isLiked) && (
        <div className="pointer-events-none absolute opacity-0" ref={prevCountView}>
          {/* <span className={cx('tabular-nums', isLiked && 'text-notification')}>{formattedPrevCount}</span> */}
          <span>{formattedPrevCount}</span>
        </div>
      )}
    </div>
  )
}

export default CountWheel
