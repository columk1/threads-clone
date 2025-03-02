import { useEffect, useState } from 'react'

export function useMediaQuery(query: string) {
  // Default to true to always render the component and then remove it if the query doesn't match
  // Note: Only render null where this hook is used when the value is false
  const [value, setValue] = useState(true)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    setValue(mediaQuery.matches)

    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches)
    }

    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [query])

  return value
}
