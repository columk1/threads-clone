import type { FunctionComponent } from 'react'

type DividerProps = {
  text?: string
  className?: string
}

const Divider: FunctionComponent<DividerProps> = ({ text, className }) => {
  return (
    <div className={`mx-auto flex w-[100px] items-center justify-center text-gray-7 ${className}`}>
      <div className="h-[0.25px] w-full bg-primary-outline" />
      <span className="px-4">{text}</span>
      <div className="h-[0.25px] w-full bg-primary-outline" />
    </div>
  )
}

export default Divider
