import { Suspense } from 'react'

import { CounterForm } from '@/components/CounterForm'
import { CurrentCount } from '@/components/CurrentCount'

export async function generateMetadata() {
  return {
    title: 'Counter',
    description: 'An example of DB operation',
  }
}

const Counter = () => {
  return (
    <>
      <CounterForm />

      <div className="mt-3">
        <Suspense fallback={<p>Loading counter...</p>}>
          <CurrentCount />
        </Suspense>
      </div>
    </>
  )
}

export const dynamic = 'force-dynamic'

export default Counter
