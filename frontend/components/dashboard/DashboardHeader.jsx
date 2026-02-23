"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BuyCreditsModal } from "@/components/modals/BuyCreditsModal"
import { InsufficientCreditsModal } from "@/components/modals/InsufficientCreditsModal"

export function DashboardHeader({ user, onUserUpdate }) {
  const [showBuyCredits, setShowBuyCredits] = useState(false)
  const [showInsufficientCredits, setShowInsufficientCredits] = useState(false)

  // Show upgrade nudge for free users with low credits
  const shouldShowUpgradeNudge = user.subscription.plan === 'free' && user.credits <= 3

  // Show zero credits prompt
  const shouldShowZeroCreditsPrompt = user.credits === 0

  const handleBuyCreditsSuccess = (updatedUser) => {
    onUserUpdate(updatedUser)
  }

  const handleUpgradeClick = () => {
    // Redirect to pricing page or show upgrade modal
    window.location.href = '/pricing'
  }

  return (
    <>
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              SEO Audit Dashboard
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-zinc-600 dark:text-zinc-400">Credits:</span>
                <span className={`font-semibold ${
                  user.credits === 0 ? 'text-red-600' : 
                  user.credits <= 3 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {user.credits}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-600 dark:text-zinc-400">Cost per audit:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">3 credits</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-600 dark:text-zinc-400">Plan:</span>
                <Badge variant={user.subscription.plan === 'free' ? 'secondary' : 'default'}>
                  {user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {user.subscription.plan === 'free' && (
              <Button onClick={handleUpgradeClick} variant="default">
                Upgrade to Premium
              </Button>
            )}
            <Button 
              onClick={() => setShowBuyCredits(true)} 
              variant="outline"
            >
              Buy Credits
            </Button>
          </div>
        </div>
      </div>

      {/* Upgrade Nudge */}
      {shouldShowUpgradeNudge && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Running low on credits?
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Upgrade to Premium for better features and priority support.
              </p>
            </div>
            <Button onClick={handleUpgradeClick} size="sm">
              Upgrade Now
            </Button>
          </div>
        </div>
      )}

      {/* Zero Credits Prompt */}
      {shouldShowZeroCreditsPrompt && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-200 mb-1">
                You're out of credits!
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                Buy more credits to continue running SEO audits.
              </p>
            </div>
            <Button onClick={() => setShowBuyCredits(true)} size="sm">
              Buy Credits
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <BuyCreditsModal
        isOpen={showBuyCredits}
        onClose={() => setShowBuyCredits(false)}
        onSuccess={handleBuyCreditsSuccess}
      />
      
      <InsufficientCreditsModal
        isOpen={showInsufficientCredits}
        onClose={() => setShowInsufficientCredits(false)}
        onBuyCredits={() => {
          setShowInsufficientCredits(false)
          setShowBuyCredits(true)
        }}
      />
    </>
  )
}
