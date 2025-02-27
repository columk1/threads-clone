type CustomToastProps = {
  text: string
  icon: React.ReactNode
  children?: React.ReactNode
}

export const CustomToast = ({ text, icon, children }: CustomToastProps) => {
  return (
    <div className="flex min-w-72 items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="flex-1">{text}</span>
      </div>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  )
}
