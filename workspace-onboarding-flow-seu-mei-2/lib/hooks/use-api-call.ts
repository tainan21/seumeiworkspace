"use client"

import { useState, useCallback } from "react"

export type ApiState<T> = {
  data: T | null
  error: string | null
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
}

export function useApiCall<T, A extends unknown[]>(
  apiFunction: (...args: A) => Promise<T>,
): [ApiState<T>, (...args: A) => Promise<T | null>, () => void] {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  })

  const execute = useCallback(
    async (...args: A): Promise<T | null> => {
      setState({
        data: null,
        error: null,
        isLoading: true,
        isSuccess: false,
        isError: false,
      })

      try {
        const result = await apiFunction(...args)
        setState({
          data: result,
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false,
        })
        return result
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Erro desconhecido"
        setState({
          data: null,
          error: errorMessage,
          isLoading: false,
          isSuccess: false,
          isError: true,
        })
        return null
      }
    },
    [apiFunction],
  )

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    })
  }, [])

  return [state, execute, reset]
}
