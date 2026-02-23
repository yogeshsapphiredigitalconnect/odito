"use client"

import React from 'react'
import { cn } from '@/lib/utils'

export function MetricCircle({
  value = 0,
  max = 100,
  size = 120,
  strokeWidth = 8,
  gradient = 'cyan',
  className,
  children
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const progress = (value / max) * circumference
  
  const gradients = {
    cyan: {
      start: '#06b6d4',
      end: '#0891b2',
      glow: 'rgba(6, 182, 212, 0.3)'
    },
    purple: {
      start: '#a855f7',
      end: '#9333ea',
      glow: 'rgba(168, 85, 247, 0.3)'
    },
    red: {
      start: '#ef4444',
      end: '#dc2626',
      glow: 'rgba(239, 68, 68, 0.3)'
    },
    green: {
      start: '#10b981',
      end: '#059669',
      glow: 'rgba(16, 185, 129, 0.3)'
    }
  }
  
  const colors = gradients[gradient] || gradients.cyan
  const gradientId = `gradient-${gradient}-${Math.random()}`
  
  return (
    <div 
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
          <filter id={`glow-${gradientId}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/20"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          filter={`url(#glow-${gradientId})`}
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out',
            dropShadow: `0 0 8px ${colors.glow}`
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

export function ScoreMetric({
  score,
  label,
  gradient = 'cyan',
  size = 120
}) {
  const getGradeFromScore = (score) => {
    if (score >= 90) return { grade: 'A+', color: 'green' }
    if (score >= 80) return { grade: 'A', color: 'green' }
    if (score >= 70) return { grade: 'B+', color: 'purple' }
    if (score >= 60) return { grade: 'B', color: 'purple' }
    if (score >= 50) return { grade: 'C+', color: 'red' }
    return { grade: 'F', color: 'red' }
  }
  
  const { grade } = getGradeFromScore(score)
  
  return (
    <MetricCircle
      value={score}
      max={100}
      size={size}
      gradient={gradient}
      className="flex flex-col items-center"
    >
      <div className="text-center">
        <div className="text-2xl font-bold text-foreground">{score}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold text-primary mt-1">{grade}</div>
      </div>
    </MetricCircle>
  )
}
