"use client"

import { Sparkles, Zap, ArrowDownToDot } from "lucide-react"
import { PricingSection } from "@/components/landing/pricing-section"

const defaultTiers = [
  {
    name: "Pay As You Go",
    price: {
      monthly: 0,
      yearly: 0,
    },
    description: "Perfect for occasional SEO audits",
    ctaType: "pay_as_you_go",
    ctaText: "Start Free Trial",
    icon: (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/30 to-gray-500/30 blur-2xl rounded-full" />
        <Zap className="w-7 h-7 relative z-10 text-gray-500 dark:text-gray-400 animate-[float_3s_ease-in-out_infinite]" />
      </div>
    ),
    features: [
      {
        name: "5 Free Credits",
        description: "Start with 5 credits to try the platform",
        included: true,
      },
      {
        name: "3 Credits Per Audit",
        description: "Comprehensive SEO analysis costs 3 credits",
        included: true,
      },
      {
        name: "Credit Packs Available",
        description: "Buy 10/50/200 credits as needed (never expire)",
        included: true,
      },
      {
        name: "Basic Dashboard",
        description: "Essential SEO audit tools and reporting",
        included: true,
      },
    ],
  },
  {
    name: "Premium",
    price: {
      monthly: 29,
      yearly: 290,
    },
    description: "Ideal for regular SEO analysis and workflows",
    highlight: true,
    badge: "Most Popular",
    ctaType: "upgrade_premium",
    ctaText: "Upgrade to Premium",
    icon: (
      <div className="relative">
        <ArrowDownToDot className="w-7 h-7 relative z-10" />
      </div>
    ),
    features: [
      {
        name: "All Pay-As-You-Go Benefits",
        description: "Credit-based pricing with full flexibility",
        included: true,
      },
      {
        name: "Premium Dashboard Features",
        description: "Enhanced SEO tools and advanced reporting",
        included: true,
      },
      {
        name: "Priority Email Support",
        description: "Faster response times for premium members",
        included: true,
      },
      {
        name: "Enhanced Workflows",
        description: "Better project organization and collaboration experience",
        included: true,
      },
    ],
  },
]

function PricingSectionDemo({ id }) {
  return <PricingSection tiers={defaultTiers} id={id} />
}

export { PricingSectionDemo }
