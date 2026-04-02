import { useEffect, useRef } from 'react'
import API_BASE_URL from "@/lib/apiConfig";

/**
 * Safe polling hook with cleanup and abort control
 * @param {Function} pollFunction - Function to call on each poll
 * @param {Object} options - Polling options
 * @param {number} options.interval - Polling interval in ms (default: 2000)
 * @param {number} options.maxAttempts - Maximum poll attempts (default: 30)
 * @param {Function} options.condition - Stop polling when this returns true
 * @param {Function} options.onError - Error callback
 */
export const usePolling = (endpoint, options = {}) => {
  const {
    interval = 2000,
    maxAttempts = 30,
    condition,
    onError
  } = options

  const timeoutRef = useRef(null)
  const attemptRef = useRef(0)
  const abortControllerRef = useRef(null)

  useEffect(() => {
    // Create new abort controller for this polling session
    abortControllerRef.current = new AbortController()

    const poll = async () => {
      // Check if polling should stop
      if (abortControllerRef.current?.signal.aborted) {
        return
      }

      attemptRef.current++

      try {
        const result = await pollFunction(attemptRef.current)

        // Check stop condition
        if (condition && condition(result)) {
          return
        }

        // Check max attempts
        if (attemptRef.current >= maxAttempts) {
          return
        }

        // Schedule next poll
        if (!abortControllerRef.current?.signal.aborted) {
          timeoutRef.current = setTimeout(poll, interval)
        }

      } catch (error) {
        if (onError) {
          onError(error, attemptRef.current)
        }

        // Continue polling on error unless max attempts reached
        if (attemptRef.current < maxAttempts && !abortControllerRef.current?.signal.aborted) {
          timeoutRef.current = setTimeout(poll, interval)
        }
      }
    }

    // Start polling
    poll()

    // Cleanup function
    return () => {
      // Abort any ongoing operations
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [pollFunction, interval, maxAttempts, condition, onError])
}

/**
 * Poll for user profile updates (credits, subscription)
 * @param {Function} onSuccess - Callback when profile changes
 * @param {Function} onError - Error callback
 */
export function useProfilePolling(onSuccess, onError) {
  const previousProfileRef = useRef(null)

  return usePolling(
    async (attempt) => {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No auth token found')
      }

      const apiUrl = API_BASE_URL;
      
      const response = await fetch(`${apiUrl}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Profile fetch failed: ${response.status}`)
      }

      const { data: profile } = await response.json()

      // Check if profile has changed
      if (previousProfileRef.current) {
        const hasChanged = 
          previousProfileRef.current.credits !== profile.credits ||
          previousProfileRef.current.subscription.plan !== profile.subscription.plan ||
          previousProfileRef.current.subscription.status !== profile.subscription.status

        if (hasChanged && onSuccess) {
          onSuccess(profile, previousProfileRef.current)
        }
      }

      previousProfileRef.current = profile
      return profile
    },
    {
      interval: 2000,
      maxAttempts: 30,
      condition: (result) => {
        // Stop polling if we detect a change
        if (previousProfileRef.current) {
          return previousProfileRef.current.credits !== result.credits ||
                 previousProfileRef.current.subscription.plan !== result.subscription.plan
        }
        return false
      },
      onError
    }
  )
}
