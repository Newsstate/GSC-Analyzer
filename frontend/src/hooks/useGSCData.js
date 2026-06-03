import { useState, useEffect, useCallback } from 'react'
import { gsc, analysis } from '../lib/api'

export function useGSCData(siteUrl) {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState({})
  const [errors, setErrors] = useState({})

  const setL = (key, val) => setLoading(p => ({ ...p, [key]: val }))
  const setE = (key, val) => setErrors(p => ({ ...p, [key]: val }))
  const setD = (key, val) => setData(p => ({ ...p, [key]: val }))

  const fetch = useCallback(async (key, fn) => {
    if (!siteUrl) return
    setL(key, true); setE(key, null)
    try { setD(key, await fn()) }
    catch (e) { setE(key, e.message) }
    finally { setL(key, false) }
  }, [siteUrl])

  const loadOverview = useCallback(() => fetch('overview', () => gsc.overview(siteUrl)), [fetch, siteUrl])
  const loadTimeseries = useCallback(() => fetch('timeseries', () => gsc.timeseries(siteUrl)), [fetch, siteUrl])
  const loadPages = useCallback(() => fetch('pages', () => gsc.pages(siteUrl)), [fetch, siteUrl])
  const loadQueries = useCallback(() => fetch('queries', () => gsc.queries(siteUrl)), [fetch, siteUrl])
  const loadOpportunities = useCallback(() => fetch('opportunities', () => gsc.opportunities(siteUrl)), [fetch, siteUrl])
  const loadCoverage = useCallback(() => fetch('coverage', () => gsc.coverage(siteUrl)), [fetch, siteUrl])
  const loadSitemaps = useCallback(() => fetch('sitemaps', () => gsc.sitemaps(siteUrl)), [fetch, siteUrl])
  const loadIssues = useCallback(() => fetch('issues', () => analysis.issues(siteUrl)), [fetch, siteUrl])
  const loadCWV = useCallback(() => fetch('cwv', () => analysis.cwv(siteUrl)), [fetch, siteUrl])
  const loadEnhancements = useCallback(() => fetch('enhancements', () => analysis.enhancements(siteUrl)), [fetch, siteUrl])

  // Load dashboard data on mount
  useEffect(() => {
    if (!siteUrl) return
    loadOverview()
    loadTimeseries()
    loadIssues()
  }, [siteUrl])

  return {
    data, loading, errors,
    loadOverview, loadTimeseries, loadPages, loadQueries,
    loadOpportunities, loadCoverage, loadSitemaps,
    loadIssues, loadCWV, loadEnhancements,
    refetchAll: () => {
      loadOverview(); loadTimeseries(); loadIssues()
    }
  }
}
