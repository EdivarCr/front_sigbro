import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/services/supabase/client'

/**
 * Hook genérico para consultas ao Supabase.
 *
 * @example
 * const { data, loading, error, refetch } = useSupabaseQuery<Produto>('produtos')
 */
export function useSupabaseQuery<T = unknown>(
  table: string,
  select = '*',
  filters?: Record<string, unknown>
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase.from(table).select(select)

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    const { data: result, error: err } = await query

    if (err) {
      setError(err.message)
      setData([])
    } else {
      setData((result as T[]) ?? [])
    }

    setLoading(false)
  }, [table, select, JSON.stringify(filters)])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
