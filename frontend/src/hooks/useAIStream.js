import { useState, useCallback } from 'react'
import { ai } from '../lib/api'

export function useAIStream() {
  const [text, setText] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  const stream = useCallback(async (endpoint, payload) => {
    setText(''); setStreaming(true); setDone(false); setError(null)
    try {
      await ai[endpoint](payload, (chunk) => {
        setText(prev => prev + chunk)
      })
      setDone(true)
    } catch (e) {
      setError(e.message)
      setDone(true)
    } finally {
      setStreaming(false)
    }
  }, [])

  const reset = useCallback(() => {
    setText(''); setStreaming(false); setDone(false); setError(null)
  }, [])

  return { text, streaming, done, error, stream, reset }
}
