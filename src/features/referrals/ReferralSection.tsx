import { useEffect, useState, type FormEvent } from 'react'
import {
  Check,
  Copy,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import {
  getReferrals,
  submitReferral,
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
          <span>用户分享</span>
        </div>
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

      {referral.scope && <p>{referral.scope}</p>}
      {referral.expires_at && <p>展示至 {new Date(referral.expires_at).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' })}</p>}
    </article>
  )
}

export function ReferralSection() {
  const [data, setData] = useState<ReferralsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedCode, setCopiedCode] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [sharing, setSharing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [shareMessage, setShareMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    getReferrals(5, controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) setData(response)
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : '内推码加载失败',
          )
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })

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

  const communityItems = data?.items.filter((item) => item.source_platform === 'community') ?? []

  const handleShare = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSubmitting(true)
    setShareMessage('')
    try {
      await submitReferral({
        code: String(form.get('code')).trim(),
        recruitment_type: String(form.get('recruitment_type')),
        scope: String(form.get('scope')).trim() || undefined,
        expires_on: String(form.get('expires_on')) || undefined,
      })
      setSharing(false)
      setShareMessage('内推码已发布，谢谢分享！')
      handleRetry()
    } catch (requestError) {
      setShareMessage(requestError instanceof Error ? requestError.message : '提交失败，请稍后重试。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="referral-section" aria-labelledby="referral-title">
      <div className="referral-heading">
        <div>
          <span className="referral-kicker">
            <Sparkles size={15} aria-hidden="true" />
            助力投递
          </span>
          <h2 id="referral-title">内推互助</h2>
          <p>分享字节跳动内推码，帮正在找工作的朋友投递。不用先分享，也能复制使用。</p>
        </div>
        {data && communityItems.length > 0 && (
          <div className="referral-summary">
            <strong>{data.total}</strong>
            <span>个用户分享码</span>
            <small>{formatUpdatedTime(data.generated_at)}</small>
          </div>
        )}
      </div>

      <div className="referral-actions">
        <button type="button" aria-expanded={sharing} disabled={submitting} onClick={() => { setSharing(!sharing); setShareMessage('') }}>{sharing ? '收起表单' : '分享内推码'}</button>
      </div>
      {sharing && <form className="referral-card referral-form" onSubmit={handleShare}>
        <label>内推码<input name="code" required minLength={3} maxLength={32} pattern="[A-Za-z0-9_\-]{3,32}" autoComplete="off" /></label>
        <label>招聘类型<select name="recruitment_type"><option value="unknown">通用／不确定</option><option value="campus">校招</option><option value="social">社招</option></select></label>
        <label>适用岗位（选填）<input name="scope" maxLength={80} /></label>
        <label>有效期（选填，北京时间）<input name="expires_on" type="date" /></label>
        <p className="referral-note">提交后公开展示。只分享你有权公开的码，请勿填写姓名或联系方式。</p>
        <div className="referral-actions"><button type="submit" disabled={submitting}>{submitting ? '发布中…' : '发布内推码'}</button></div>
      </form>}
      {shareMessage && <p role="status">{shareMessage}</p>}

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
      ) : communityItems.length ? (
        <div className="referral-grid">
          {communityItems.map((referral) => (
            <ReferralCard
              key={referral.id}
              referral={referral}
              copied={copiedCode === referral.code}
              onCopy={handleCopy}
            />
          ))}
        </div>
      ) : (
        <div className="referral-state">暂无可用内推码，欢迎分享一个。</div>
      )}

      <p className="referral-note">
        内推码由用户分享，未经官方验证。是否可用以字节跳动官方投递页面为准。
      </p>
    </section>
  )
}
