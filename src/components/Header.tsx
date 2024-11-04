import type { FunctionComponent } from 'react'

type HeaderProps = {
  title: string
  children?: React.ReactNode
}

const Header: FunctionComponent<HeaderProps> = ({ title, children }) => {
  return (
    <nav className="z-10 hidden h-[60px] w-full grid-rows-[1fr] place-items-center md:grid md:grid-cols-[1fr_minmax(auto,65%)_1fr]">
      <div className="col-start-2 flex items-center justify-center gap-3 text-[15px] font-semibold text-primary-text">
        <a href="/">{title}</a>
        {children}
      </div>
    </nav>
  )
}

export default Header
