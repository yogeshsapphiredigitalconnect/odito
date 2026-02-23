'use client'

import Link from 'next/link'

export default function PaymentCanceledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Payment Canceled</h1>
        <p className="text-gray-400 mb-6">
          No charges were made.
        </p>
        <Link href="/" className="underline">
          Back to pricing
        </Link>
      </div>
    </div>
  )
}
