import { useState } from 'react'
import API_BASE_URL from "@/lib/apiConfig";

export const useAudit = () => {
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState(null)

  const startAudit = async (onInsufficientCredits) => {
    setIsStarting(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const apiUrl = API_BASE_URL;

      const response = await fetch(`${apiUrl}/seo/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status === 403) {
        const errorData = await response.json()
        if (errorData.message?.includes('Insufficient credits')) {
          onInsufficientCredits?.()
          return { success: false, insufficientCredits: true }
        }
      }

      if (!response.ok) {
        throw new Error(errorData.message || 'Failed to start audit')
      }

      const result = await response.json()
      return { success: true, data: result }

    } catch (err) {
      const errorMessage = err.message || 'Failed to start audit'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsStarting(false)
    }
  }

  return {
    startAudit,
    isStarting,
    error,
    clearError: () => setError(null)
  }
}
