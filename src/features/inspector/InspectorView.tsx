import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  Link2,
  LoaderCircle,
  ShieldCheck,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { inspectJob, type JobTimeResponse } from '../../api'

const EXAMPLE_URL =
  'https://jobs.bytedance.com/experienced/position/7494870018459846919/detail'

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : '解析失败，请稍后重试'
}

export function InspectorView() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<JobTimeResponse | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!url.trim()) return

    try {
      setLoading(true)
      setError('')
      setResult(null)
      setResult(await inspectJob(url.trim()))
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="inspector-page">
      <section className="inspector-hero">
        <span className="eyebrow">
          <ShieldCheck size={15} />
          真实发布时间
        </span>
        <h1>这个岗位，还值得投吗？</h1>
        <p>
          粘贴字节社招或校招岗位链接，LuckyJob 会帮你找出真实发布时间，
          避免把精力投入到长期沉寂的岗位。
        </p>

        <form className="inspector-form" onSubmit={handleSubmit}>
          <Link2 size={20} aria-hidden="true" />
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="粘贴 jobs.bytedance.com 岗位链接"
            disabled={loading}
            required
          />
          <button type="submit" disabled={loading || !url.trim()}>
            {loading ? <LoaderCircle className="spin" size={18} /> : null}
            {loading ? '解析中' : '解析链接'}
          </button>
        </form>

        <button
          type="button"
          className="example-link"
          onClick={() => setUrl(EXAMPLE_URL)}
        >
          使用示例岗位
        </button>

        {error && <div className="inspector-error">{error}</div>}
      </section>

      {result && (
        <section className="inspect-result">
          <div className="inspect-result-heading">
            <span className="result-icon">
              <CheckCircle2 size={25} />
            </span>
            <div>
              <span>{result.site_name || 'ByteDance Jobs'}</span>
              <h2>{result.title || '字节跳动岗位'}</h2>
            </div>
          </div>

          <div className="inspect-result-grid">
            <div>
              <span>真实发布时间</span>
              <strong>
                {format(parseISO(result.publish_time), 'yyyy年MM月dd日 HH:mm', {
                  locale: zhCN,
                })}
              </strong>
            </div>
            <div>
              <span>距今天数</span>
              <strong>{result.age_days <= 0 ? '今天发布' : `${result.age_days}天前`}</strong>
            </div>
          </div>

          <div className="inspect-advice">
            <CalendarCheck size={20} />
            <div>
              <strong>{result.should_apply ? '值得优先尝试' : '建议谨慎投入时间'}</strong>
              <p>{result.advice_reason}</p>
            </div>
          </div>

          <a href={result.url} target="_blank" rel="noreferrer">
            查看字节官网岗位
            <ArrowUpRight size={18} />
          </a>
        </section>
      )}
    </main>
  )
}
