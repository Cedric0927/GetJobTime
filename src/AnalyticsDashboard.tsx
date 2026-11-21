import { useState, type FormEvent } from 'react'
import { getDailyAnalytics, type AnalyticsDay } from './analytics'

const metrics = {
  page_view: '页面浏览', job_search: '搜索岗位', filter_social: '筛选社招', filter_campus: '筛选校招',
  job_detail: '打开详情', apply_click: '前往官网', inspect_submit: '提交查询', inspect_success: '查到发布时间',
  referral_copy: '复制内推码', referral_publish: '发布内推码',
}

export function AnalyticsDashboard() {
  const [days, setDays] = useState<AnalyticsDay[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function load(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setBusy(true)
    setError('')
    setDays([])
    try {
      setDays(await getDailyAnalytics(String(form.get('token')).trim(), Number(form.get('range'))))
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : '日报读取失败。')
    } finally {
      setBusy(false)
    }
  }

  return <main className="referral-section" style={{ margin: '2rem auto', maxWidth: '76rem' }}>
    <h1>LuckyJob 每日运营统计</h1>
    <p>北京时间。单元格为次数 / 去重浏览器数；官网跳转不等于完成投递。</p>
    <form className="referral-form" onSubmit={load}>
      <label>管理员令牌 <input name="token" type="password" required autoComplete="off" /></label>
      <label>日期范围 <select name="range" defaultValue="7"><option value="7">近 7 天</option><option value="30">近 30 天</option></select></label>
      <div className="referral-actions"><button disabled={busy}>{busy ? '查询中…' : '查看日报'}</button></div>
    </form>
    {error && <p role="alert">{error}</p>}
    {days.length > 0 && <div style={{ overflowX: 'auto' }}><table style={{ minWidth: '68rem', textAlign: 'center' }}>
      <thead><tr><th>日期</th>{Object.values(metrics).map((label) => <th key={label}>{label}</th>)}<th>详情与跳转重合</th></tr></thead>
      <tbody>{days.map(({ day, events, detail_and_apply_browsers }) => {
        const detailBrowsers = events.job_detail?.browsers ?? 0
        return <tr key={day}><th scope="row">{day}</th>{Object.keys(metrics).map((key) => <td key={key}>{events[key]?.count ?? 0} / {events[key]?.browsers ?? 0}</td>)}
          <td>{detailBrowsers ? `${detail_and_apply_browsers} / ${detailBrowsers} (${(100 * detail_and_apply_browsers / detailBrowsers).toFixed(1)}%)` : '—'}</td></tr>
      })}</tbody>
    </table></div>}
  </main>
}
