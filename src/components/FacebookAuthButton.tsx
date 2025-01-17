import { ChevronRight } from 'lucide-react'

type FacebookAuthButtonProps = {
  // callback?: () => void
  className?: string
  children?: React.ReactNode
  iconSize?: string
}

const FacebookAuthButton = ({ className, iconSize, children }: FacebookAuthButtonProps) => {
  return (
    <button
      type="button"
      className={`flex w-full items-center justify-between gap-2 rounded-xl border border-primary-outline bg-transparent p-5 pr-3 font-bold ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={iconSize || '45'}
        height={iconSize || '45'}
        viewBox="0 0 24 24"
        fill="#1877F2"
        stroke="#1877F2"
        strokeWidth="0"
        strokeLinecap="round"
        strokeLinejoin="round"
        // eslint-disable-next-line tailwindcss/no-custom-classname
        className="lucide lucide-facebook"
      >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
      {children}
      <ChevronRight className="size-5 text-placeholder-text" />
    </button>
  )
}

export default FacebookAuthButton
