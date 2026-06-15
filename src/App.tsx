import { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, CalendarDays, Clock3, RefreshCw } from 'lucide-react'
import { Analytics } from '@vercel/analytics/react'
import {
  getJobDetail,
  getJobFilters,
  getJobs,
  getJobsHealth,
  getJobStats,
  type JobDetail,
  type JobFiltersResponse,
  type JobListItem,
  type JobsHealth,
  type JobStats,
} from './api'
import { JobDetailPanel } from './features/jobs/JobDetailPanel'
import {
  JobFilters,
  type JobFilterState,
} from './features/jobs/JobFilters'
import { JobList } from './features/jobs/JobList'
import { InspectorView } from './features/inspector/InspectorView'
import heroVisual from './assets/luckyjob-hero.png'

type AppView = 'jobs' | 'inspector'

const initialFilters: JobFilterState = {
  keyword: '',
  freshDays: 30,
  source: '',
  locationCode: '',
  categoryId: '',
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '请求失败，请稍后重试'
}

function formatSyncTime(value?: string | null) {
  if (!value) return '等待首次同步'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '同步时间未知'

  return `更新于 ${date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })}`
}

function App() {
  const [view, setView] = useState<AppView>('jobs')
  const [filters, setFilters] = useState(initialFilters)
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [jobs, setJobs] = useState<JobListItem[]>([])
  const [total, setTotal] = useState(0)
  const [jobsLoading, setJobsLoading] = useState(true)
  const [jobsError, setJobsError] = useState('')
  const [filtersData, setFiltersData] = useState<JobFiltersResponse | null>(null)
  const [filtersLoading, setFiltersLoading] = useState(true)
  const [stats, setStats] = useState<JobStats | null>(null)
  const [health, setHealth] = useState<JobsHealth | null>(null)
  const [selectedJob, setSelectedJob] = useState<JobListItem | null>(null)
  const [jobDetail, setJobDetail] = useState<JobDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const firstRequest = useRef(true)
  const pageSize = 20

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedKeyword(filters.keyword.trim()),
      350,
    )
    return () => window.clearTimeout(timeout)
  }, [filters.keyword])

  useEffect(() => {
    const controller = new AbortController()

    Promise.allSettled([
      getJobStats(controller.signal),
      getJobsHealth(controller.signal),
    ]).then(([statsResult, healthResult]) => {
      if (statsResult.status === 'fulfilled') setStats(statsResult.value)
      if (healthResult.status === 'fulfilled') setHealth(healthResult.value)
    })

    return () => controller.abort()
  }, [refreshKey])

  useEffect(() => {
    const controller = new AbortController()

    getJobFilters(
      filters.freshDays,
      filters.source || undefined,
      controller.signal,
    )
      .then(setFiltersData)
      .catch((error: unknown) => {
        if ((error as { name?: string }).name !== 'AbortError') {
          setFiltersData(null)
        }
      })
      .finally(() => setFiltersLoading(false))

    return () => controller.abort()
  }, [filters.freshDays, filters.source, refreshKey])

  useEffect(() => {
    const controller = new AbortController()

    getJobs(
      {
        fresh_days: filters.freshDays,
        keyword: debouncedKeyword || undefined,
        source: filters.source || undefined,
        location_code: filters.locationCode || undefined,
        category_id: filters.categoryId || undefined,
        page,
        page_size: pageSize,
      },
      controller.signal,
    )
      .then((response) => {
        setJobs(response.items)
        setTotal(response.total)

        if (
          firstRequest.current &&
          response.items[0] &&
          window.matchMedia('(min-width: 1181px)').matches
        ) {
          setDetailLoading(true)
          setSelectedJob(response.items[0])
          firstRequest.current = false
        }
      })
      .catch((error: unknown) => {
        if ((error as { name?: string }).name !== 'AbortError') {
          setJobsError(getErrorMessage(error))
          setJobs([])
          setTotal(0)
        }
      })
      .finally(() => setJobsLoading(false))

    return () => controller.abort()
  }, [
    debouncedKeyword,
    filters.categoryId,
    filters.freshDays,
    filters.locationCode,
    filters.source,
    page,
    refreshKey,
  ])

  useEffect(() => {
    if (!selectedJob) return
    const controller = new AbortController()

    getJobDetail(selectedJob.id, controller.signal)
      .then(setJobDetail)
      .catch((error: unknown) => {
        if ((error as { name?: string }).name !== 'AbortError') {
          setDetailError(getErrorMessage(error))
        }
      })
      .finally(() => setDetailLoading(false))

    return () => controller.abort()
  }, [selectedJob])

  const statsCards = useMemo(
    () => [
      {
        label: '今日新增',
        value: stats?.fresh_1_days,
        icon: Activity,
        tone: 'mint',
      },
      {
        label: '3天内',
        value: stats?.fresh_3_days,
        icon: Clock3,
        tone: 'blue',
      },
      {
        label: '7天内',
        value: stats?.fresh_7_days,
        icon: CalendarDays,
        tone: 'violet',
      },
      {
        label: '30天内',
        value: stats?.fresh_30_days,
        icon: CalendarDays,
        tone: 'indigo',
      },
    ],
    [stats],
  )

  const handleFiltersChange = (next: JobFilterState) => {
    setPage(1)
    setJobsLoading(true)
    setJobsError('')
    if (
      filters.freshDays !== next.freshDays ||
      filters.source !== next.source
    ) {
      setFiltersLoading(true)
    }
    setSelectedJob(null)
    setJobDetail(null)
    setFilters((current) => {
      if (current.source !== next.source) {
        return { ...next, locationCode: '', categoryId: '' }
      }
      return next
    })
  }

  const handleSelectJob = (job: JobListItem) => {
    setDetailLoading(true)
    setDetailError('')
    setJobDetail(null)
    setSelectedJob(job)
  }

  const handlePageChange = (nextPage: number) => {
    setJobsLoading(true)
    setJobsError('')
    setSelectedJob(null)
    setJobDetail(null)
    setPage(nextPage)
  }

  const handleRefresh = () => {
    setJobsLoading(true)
    setJobsError('')
    setFiltersLoading(true)
    setRefreshKey((value) => value + 1)
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a href="/" className="brand" aria-label="LuckyJob 首页">
          Lucky<span>Job</span>
        </a>
        <nav aria-label="主导航">
          <button
            type="button"
            className={view === 'jobs' ? 'active' : ''}
            onClick={() => {
              setView('jobs')
              setSelectedJob(null)
              setJobDetail(null)
            }}
          >
            最新岗位
          </button>
          <button
            type="button"
            className={view === 'inspector' ? 'active' : ''}
            onClick={() => setView('inspector')}
          >
            链接查时间
          </button>
        </nav>
        <div className="sync-status">
          <span className={health?.healthy === false ? 'is-stale' : ''} />
          <strong>{health?.healthy === false ? '数据同步延迟' : '数据实时同步中'}</strong>
          <small>{formatSyncTime(stats?.last_sync_at ?? health?.last_success_at)}</small>
          <button
            type="button"
            aria-label="刷新数据"
            onClick={handleRefresh}
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </header>

      {view === 'jobs' ? (
        <main>
          <section className="hero">
            <img src={heroVisual} alt="" className="hero-visual" />
            <div className="hero-copy">
              <span className="eyebrow">字节社招 · 字节校招</span>
              <h1>只看真正的新岗位</h1>
              <p>
                汇总字节跳动最新社招与校招岗位，先看发布时间，
                <br />
                再决定是否投递。
              </p>
            </div>

            <div className="stats-grid">
              {statsCards.map((card) => {
                const Icon = card.icon
                return (
                  <article key={card.label} className={`stat-card ${card.tone}`}>
                    <div>
                      <span className="stat-icon">
                        <Icon size={17} />
                      </span>
                      <span>{card.label}</span>
                    </div>
                    <strong>
                      {card.value === undefined
                        ? '—'
                        : card.value.toLocaleString('zh-CN')}
                    </strong>
                    <small>个岗位</small>
                  </article>
                )
              })}
            </div>
          </section>

          <div className="workspace">
            <JobFilters
              value={filters}
              options={filtersData}
              loading={filtersLoading}
              onChange={handleFiltersChange}
            />

            <div className="workspace-grid">
              <JobList
                items={jobs}
                selectedId={selectedJob?.id}
                loading={jobsLoading}
                error={jobsError}
                page={page}
                pageSize={pageSize}
                total={total}
                onSelect={handleSelectJob}
                onPageChange={handlePageChange}
                onRetry={handleRefresh}
              />
              <JobDetailPanel
                job={selectedJob}
                detail={jobDetail}
                loading={detailLoading}
                error={detailError}
                onClose={() => {
                  setSelectedJob(null)
                  setJobDetail(null)
                }}
              />
            </div>
          </div>
        </main>
      ) : (
        <InspectorView />
      )}

      <footer>
        <span>LuckyJob</span>
        <p>只看真实发布时间，把精力留给更值得的机会。</p>
      </footer>
      <Analytics />
    </div>
  )
}

export default App
