'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    router.push('/dashboard')
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary mb-4">
          <span className="text-xl font-bold text-primary-foreground">E</span>
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">Elevision</h1>
        <p className="text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    </main>
  )
}
