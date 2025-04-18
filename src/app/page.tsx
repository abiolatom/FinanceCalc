'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Finance Clarity</h1>
        <p className="text-lg mb-6">Your personal finance management solution</p>
        <p className="text-md mb-8">
          Take control of your finances with our easy-to-use calculator.
        </p>
        <Button onClick={() => router.push('/calculator')}>Get Started</Button>
      </div>
    </div>
  )
}
