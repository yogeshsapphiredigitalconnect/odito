'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

function PaymentSuccessPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const sessionId = searchParams.get('session_id')
  const type = searchParams.get('type')

  useEffect(() => {
    if (!sessionId) return

    // Optionally poll backend to refresh user subscription
    // Or just redirect after a delay
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 3000)

    return () => clearTimeout(timer)
  }, [sessionId, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Payment Successful 🎉</h1>
        <p className="text-gray-400 mb-6">
          Your {type === 'subscription' ? 'subscription' : 'payment'} was successful.
        </p>
        <p className="text-sm text-gray-500">
          Redirecting you to dashboard…
        </p>
      </div>
    </div>
  )
}

// Export the page wrapped in Suspense
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessPageContent />
    </Suspense>
  )
}
