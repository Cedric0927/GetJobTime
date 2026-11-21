const baseUrl = import.meta.env.VITE_JOBTIME_API_URL ??
  (import.meta.env.DEV ? '/api/jobtime' : 'https://api.apphome.me/api/v1/apps/jobtime')

const browserId = (() => {
  try {
    const key = 'luckyjob-anonymous-browser'
    const saved = localStorage.getItem(key)
    if (saved && /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(saved)) return saved
    const id = crypto.randomUUID()
    localStorage.setItem(key, id)
    return id
  } catch {
    return undefined
  }
})()

export const analyticsHeaders: Record<string, string> = browserId ? { 'X-Jobtime-Browser': browserId } : {}

export function track(event: 'page_view' | 'job_search' | 'filter_social' | 'filter_campus' | 'job_detail' | 'apply_click' | 'referral_copy') {
  if (!browserId) return
  void fetch(`${baseUrl}/analytics/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, browser: browserId }),
    keepalive: true,
  }).catch(() => {})
}

export interface AnalyticsDay {
  day: string
  events: Record<string, { count: number; browsers: number }>
  detail_and_apply_browsers: number
}

export async function getDailyAnalytics(token: string, days: number) {
  const response = await fetch(`${baseUrl}/analytics/daily?days=${days}`, {
    cache: 'no-store', headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error(response.status === 401 ? '访问令牌无效或服务端尚未配置。' : '暂时无法加载日报。')
  return await response.json() as AnalyticsDay[]
}
