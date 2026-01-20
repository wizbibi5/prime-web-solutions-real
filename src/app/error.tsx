'use client'

import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function Error() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">500 - Server Error</h1>
        <p className="text-xl mb-4">
          Something went wrong. Please try again later.
        </p>
        <Link
          href="/"
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
}
