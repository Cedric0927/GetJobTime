const API_BASE_URL =
  import.meta.env.VITE_JOBTIME_API_URL ??
  (import.meta.env.DEV
    ? '/api/jobtime'
    : 'https://api.apphome.me/api/v1/apps/jobtime')

export type JobSource = 'bytedance_social' | 'bytedance_campus'
export type FreshnessBucket = '1d' | '3d' | '7d' | '30d' | 'older'

export interface JobListItem {
  id: string
  source: JobSource
  external_job_id: string
  title: string
  job_url: string
  job_code?: string | null
  description_summary?: string | null
  category_id?: string | null
  category_name?: string | null
  location_code?: string | null
  location_name?: string | null
  department?: string | null
  recruitment_type?: string | null
  publish_time: string
  publish_timestamp_ms: number
  age_days: number
  freshness_bucket: FreshnessBucket
  status: string
}

export interface JobDetail extends JobListItem {
  description?: string | null
  requirement?: string | null
  jd_visible: boolean
  jd_cached_until?: string | null
}

export interface JobsResponse {
  items: JobListItem[]
  page: number
  page_size: number
  total: number
  fresh_days?: number | null
}

export interface FilterOption {
  id: string
  name: string
  count: number
}

export interface JobFiltersResponse {
  categories: FilterOption[]
  locations: FilterOption[]
  recruitment_types: FilterOption[]
}

export interface JobStats {
  sources: JobSource[]
  fresh_1_days: number
  fresh_3_days: number
  fresh_7_days: number
  fresh_30_days: number
  total_active: number
  last_sync_at?: string | null
  last_sync_status?: string | null
}

export interface JobsHealth {
  healthy: boolean
  last_success_at?: string | null
  last_success_age_seconds?: number | null
  stale_threshold_seconds?: number | null
  sources: JobSource[]
}

export interface JobTimeResponse {
  url: string
  host: string
  site_name: string
  job_id: string
  title: string
  job_code?: string | null
  description?: string | null
  requirement?: string | null
  publish_timestamp_ms: number
  publish_time: string
  age_days: number
  should_apply: boolean
  advice_level:
    | 'highly_recommended'
    | 'recommended'
    | 'consider'
    | 'low_priority'
    | 'not_recommended'
    | 'unknown'
  advice_reason: string
  extractor: string
  confidence: string
  job_info?: unknown
}

export interface JobsQuery {
  fresh_days: number
  keyword?: string
  category_id?: string
  location_code?: string
  recruitment_type?: string
  source?: JobSource
  page?: number
  page_size?: number
}

interface ApiErrorBody {
  detail?: string
  message?: string
  error?: {
    message?: string
  }
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init)
  const data = (await response.json().catch(() => null)) as
    | T
    | ApiErrorBody
    | null

  if (!response.ok) {
    const error = data as ApiErrorBody | null
    throw new Error(
      error?.error?.message ??
        error?.detail ??
        error?.message ??
        `请求失败（${response.status}）`,
    )
  }

  return data as T
}

function toQueryString(
  params: Record<string, string | number | undefined>,
): string {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.set(key, String(value))
    }
  })

  const query = search.toString()
  return query ? `?${query}` : ''
}

export function getJobs(query: JobsQuery, signal?: AbortSignal) {
  return apiFetch<JobsResponse>(
    `/jobs${toQueryString({
      fresh_days: query.fresh_days,
      keyword: query.keyword,
      category_id: query.category_id,
      location_code: query.location_code,
      recruitment_type: query.recruitment_type,
      source: query.source,
      page: query.page ?? 1,
      page_size: query.page_size ?? 20,
    })}`,
    { signal },
  )
}

export function getJobFilters(
  freshDays: number,
  source?: JobSource,
  signal?: AbortSignal,
) {
  return apiFetch<JobFiltersResponse>(
    `/jobs/filters${toQueryString({
      fresh_days: freshDays,
      source,
    })}`,
    { signal },
  )
}

export function getJobStats(signal?: AbortSignal) {
  return apiFetch<JobStats>('/jobs/stats', { signal })
}

export function getJobsHealth(signal?: AbortSignal) {
  return apiFetch<JobsHealth>('/jobs/health', { signal })
}

export function getJobDetail(id: string, signal?: AbortSignal) {
  return apiFetch<JobDetail>(`/jobs/${id}`, { signal })
}

export function inspectJob(url: string, signal?: AbortSignal) {
  return apiFetch<JobTimeResponse>('/inspect', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  })
}
