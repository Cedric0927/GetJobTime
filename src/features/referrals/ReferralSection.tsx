import { useEffect, useState } from 'react'
import {
  Check,
  Copy,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import {
  getReferrals,
  type ReferralCode,
  type ReferralsResponse,
} from '../../api'

const recruitmentLabels: Record<string, string> = {
  campus: '校招',
  social: '社招',
  unknown: '通用',
}

function formatUpdatedTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '更新时间未知'

  return `更新时间 ${date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })}`
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const input = document.createElement('textarea')
  input.value = value
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.appendChild(input)
  input.select()
  document.execCommand('copy')
  input.remove()
}

function ReferralCard({
  referral,
  copied,
  onCopy,
}: {
  referral: ReferralCode
  copied: boolean
  onCopy: (code: string) => void
}) {
  const recruitmentType =
    recruitmentLabels[referral.recruitment_type] ??
    referral.recruitment_type ??
    '通用'

  return (
    <article className={`referral-card${referral.is_primary ? ' primary' : ''}`}>
      <div className="referral-card-topline">
        <div className="referral-badges">
          <span>{recruitmentType}</span>
          {referral.is_primary && <strong>优先使用</strong>}
        </div>
        <span className="referral-confidence">
          <ShieldCheck size={14} aria-hidden="true" />
          可信度 {referral.confidence}%
        </span>
      </div>

      <p className="referral-code-label">字节跳动内推码</p>
      <div className="referral-code-row">
        <code>{referral.code}</code>
        <button
          type="button"
          className={copied ? 'copied' : ''}
          onClick={() => onCopy(referral.code)}
          aria-label={`复制内推码 ${referral.code}`}
        >
          {copied ? <Check size={17} /> : <Copy size={17} />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>

    </article>
  )
}

export function ReferralSection() {
  const [data, setData] = useState<ReferralsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedCode, setCopiedCode] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    getReferrals(5, controller.signal)
      .then(setData)
      .catch((requestError: unknown) => {
        if ((requestError as { name?: string }).name !== 'AbortError') {
          setError(
            requestError instanceof Error
              ? requestError.message
              : '内推码加载失败',
          )
        }
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [refreshKey])

  const handleCopy = async (code: string) => {
    try {
      await copyText(code)
      setCopiedCode(code)
      window.setTimeout(() => setCopiedCode(''), 1800)
    } catch {
      setCopiedCode('')
    }
  }

  const handleRetry = () => {
    setLoading(true)
    setError('')
    setRefreshKey((key) => key + 1)
  }

  return (
    <section className="referral-section" aria-labelledby="referral-title">
      <div className="referral-heading">
        <div>
          <span className="referral-kicker">
            <Sparkles size={15} aria-hidden="true" />
            助力投递
          </span>
          <h2 id="referral-title">找到岗位，再用内推码完成投递</h2>
          <p>精选近期验证的字节跳动内推码，复制后前往官方招聘页面使用。</p>
        </div>
        {data && data.total > 0 && (
          <div className="referral-summary">
            <strong>{data.total}</strong>
            <span>个有效内推码</span>
            <small>{formatUpdatedTime(data.generated_at)}</small>
          </div>
        )}
      </div>

      {loading ? (
        <div className="referral-state">
          <RefreshCw className="spin" size={18} aria-hidden="true" />
          正在获取近期有效内推码…
        </div>
      ) : error ? (
        <div className="referral-state error">
          <span>暂时无法加载内推码，不影响正常查找和投递岗位。</span>
          <button type="button" onClick={handleRetry}>
            重新加载
          </button>
        </div>
      ) : data?.items.length ? (
        <div className="referral-grid">
          {data.items.map((referral) => (
            <ReferralCard
              key={referral.id}
              referral={referral}
              copied={copiedCode === referral.code}
              onCopy={handleCopy}
            />
          ))}
        </div>
      ) : (
        <div className="referral-state">当前暂无可用内推码，请稍后再来看看。</div>
      )}

      <p className="referral-note">
        内推码来自公开信息并定期核验，实际有效性以字节跳动官方投递页面为准。
      </p>
    </section>
  )
}
