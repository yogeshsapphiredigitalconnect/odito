"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRightIcon, CheckIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { savePaymentIntent } from "@/utils/paymentUtils"

function PricingSection({ tiers, className, id }) {
  const [isYearly, setIsYearly] = useState(false)
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  // Handle button clicks based on ctaType
  const handleCtaClick = (ctaType) => {
    switch (ctaType) {
      case 'pay_as_you_go':
        // Check if user is logged in
        if (isAuthenticated) {
          router.push('/dashboard')
        } else {
          router.push('/signup')
        }
        break
        
      case 'upgrade_premium':
        // Create payment intent and handle auth flow
        const planType = isYearly ? 'premium_yearly' : 'premium_monthly'
        const billingCycle = isYearly ? 'yearly' : 'monthly'
        const price = isYearly ? '$290/year' : '$29/month'
        
        // Save payment intent to localStorage
        savePaymentIntent({
          planType,
          billingCycle,
          planName: 'Premium',
          price
        })
        
        // Check authentication and route accordingly
        if (!isAuthenticated) {
          router.push('/login')
        } else {
          // User is logged in, trigger confirmation modal
          // The modal will be handled by the global component in app layout
          window.dispatchEvent(new CustomEvent('showPaymentConfirm'))
        }
        break
        
      default:
        console.warn('Unknown CTA type:', ctaType)
    }
  }


  const buttonStyles = {
    default: cn(
      "h-12 bg-white dark:bg-zinc-900",
      "hover:bg-zinc-50 dark:hover:bg-zinc-800",
      "text-zinc-900 dark:text-zinc-100",
      "border border-zinc-200 dark:border-zinc-800",
      "hover:border-zinc-300 dark:hover:border-zinc-700",
      "shadow-sm hover:shadow-md",
      "text-sm font-medium",
    ),
    highlight: cn(
      "h-12 bg-zinc-900 dark:bg-zinc-100",
      "hover:bg-zinc-800 dark:hover:bg-zinc-300",
      "text-white dark:text-zinc-900",
      "shadow-[0_1px_15px_rgba(0,0,0,0.1)]",
      "hover:shadow-[0_1px_20px_rgba(0,0,0,0.15)]",
      "font-semibold text-base",
    ),
  }

  const badgeStyles = cn(
    "px-4 py-1.5 text-sm font-medium",
    "bg-zinc-900 dark:bg-zinc-100",
    "text-white dark:text-zinc-900",
    "border-none shadow-lg",
  )

  return (
    <section
      id={id}
      className={cn(
        "relative bg-background text-foreground",
        "pt-2 pb-6 px-2 md:pt-8 md:pb-16 lg:pt-10 lg:pb-16",
        "overflow-hidden",
        className,
      )}
    >
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex flex-col items-center gap-2 mb-5">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl text-center">
            Pay only for what you use. No hidden fees, no surprise bills.
          </p>
          <div className="inline-flex items-center p-1.5 bg-white dark:bg-zinc-800/50 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm">
            {["Monthly", "Yearly"].map((period) => (
              <button
                key={period}
                onClick={() => setIsYearly(period === "Yearly")}
                className={cn(
                  "px-8 py-2.5 text-sm font-medium rounded-full transition-all duration-300",
                  (period === "Yearly") === isYearly
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100",
                )}
              >
                {period}
              </button>
            ))}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
            {isYearly ? "Save 20% with annual billing (best value)" : "Pay month-to-month for maximum flexibility"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "relative group backdrop-blur-sm",
                "rounded-3xl transition-all duration-300",
                "flex flex-col",
                tier.highlight
                  ? "bg-gradient-to-b from-zinc-100/80 to-transparent dark:from-zinc-400/[0.15]"
                  : "bg-white dark:bg-zinc-800/50",
                "border",
                tier.highlight
                  ? "border-zinc-400/50 dark:border-zinc-400/20 shadow-xl"
                  : "border-zinc-200 dark:border-zinc-700 shadow-md",
                "transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20"
              )}
            >
              {tier.badge && tier.highlight && (
                <div className="absolute -top-4 left-6">
                  <Badge className={badgeStyles}>{tier.badge}</Badge>
                </div>
              )}

              <div className="p-5 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={cn(
                      "p-3 rounded-xl",
                      tier.highlight
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
                    )}
                  >
                    {tier.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {tier.name}
                  </h3>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                      ${isYearly ? tier.price.yearly : tier.price.monthly}
                    </span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      /{isYearly ? "year" : "month"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {tier.description}
                  </p>
                </div>

                <div className="space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature.name} className="flex gap-4">
                      <div
                        className={cn(
                          "mt-1 p-0.5 rounded-full transition-colors duration-200",
                          feature.included
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-zinc-400 dark:text-zinc-600",
                        )}
                      >
                        <CheckIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {feature.name}
                        </div>
                        <div className="text-sm text-zinc-500 dark:text-zinc-400">
                          {feature.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 pt-0 mt-auto">
                <Button
                  onClick={() => handleCtaClick(tier.ctaType)}
                  className={cn(
                    "w-full relative transition-all duration-300",
                    tier.highlight
                      ? buttonStyles.highlight
                      : buttonStyles.default,
                  )}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {tier.ctaText}
                    <ArrowRightIcon className="w-4 h-4" />
                  </span>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* How Pricing Works Section */}
        <div className="mt-12 p-6 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-200 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 text-center">
            How Pricing Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">1</span>
              </div>
              <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                Credits power every action
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Each analysis, report, or API call uses credits based on complexity
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 dark:text-green-400 font-semibold">2</span>
              </div>
              <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                Never lose your progress
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Unused credits roll over for 30 days, or purchase more anytime
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 dark:text-purple-400 font-semibold">3</span>
              </div>
              <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                Plans unlock capabilities
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Higher tiers include more features, faster processing, and better support
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export { PricingSection }
