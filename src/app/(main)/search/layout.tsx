import { SearchProvider } from '@/contexts/SearchContext'

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <SearchProvider>{children}</SearchProvider>
}
