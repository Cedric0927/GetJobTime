import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  LoaderCircle,
  MapPin,
  X,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { JobDetail, JobListItem } from '../../api'

interface JobDetailPanelProps {
  job: JobListItem | null
  detail: JobDetail | null
  loading: boolean
  error: string
  onClose: () => void
}

function formatPublishTime(value?: string) {
  if (!value) return '发布时间未知'

  try {
    return format(parseISO(value), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })
  } catch {
    return value
  }
}

function DetailText({
  title,
  value,
}: {
  title: string
  value?: string | null
}) {
  if (!value) return null

  return (
    <section className="detail-section">
      <h3>{title}</h3>
      <div className="detail-copy">{value}</div>
    </section>
  )
}

export function JobDetailPanel({
  job,
  detail,
  loading,
  error,
  onClose,
}: JobDetailPanelProps) {
  if (!job) {
    return (
      <aside className="detail-panel detail-placeholder">
        <span className="placeholder-icon">
          <BriefcaseBusiness size={24} />
        </span>
        <strong>选择一个岗位查看 JD</strong>
        <p>岗位职责、任职要求和真实发布时间会在这里展示。</p>
      </aside>
    )
  }

  const visibleJob = detail ?? job

  return (
    <>
      <button
        type="button"
        className="detail-backdrop"
        aria-label="关闭岗位详情"
        onClick={onClose}
      />
      <aside className="detail-panel is-open">
        <button
          type="button"
          className="detail-close"
          aria-label="关闭岗位详情"
          onClick={onClose}
        >
          <X size={19} />
        </button>

        <div className="detail-heading">
          <div className="detail-tags">
            <span
              className={
                visibleJob.source === 'bytedance_campus'
                  ? 'source-badge campus'
                  : 'source-badge'
              }
            >
              {visibleJob.source === 'bytedance_campus' ? '校招' : '社招'}
            </span>
            {visibleJob.category_name && <span>{visibleJob.category_name}</span>}
          </div>
          <h2>{visibleJob.title}</h2>
          <p>{visibleJob.department || '字节跳动'}</p>
          <div className="detail-meta">
            <span>
              <MapPin size={15} />
              {visibleJob.location_name || '地点待定'}
            </span>
            <span>
              <CalendarDays size={15} />
              {formatPublishTime(visibleJob.publish_time)}
            </span>
          </div>
        </div>

        <div className="detail-body">
          {loading ? (
            <div className="detail-loading">
              <LoaderCircle className="spin" size={24} />
              正在加载完整 JD
            </div>
          ) : error ? (
            <div className="detail-notice error">{error}</div>
          ) : detail?.jd_visible === false ? (
            <div className="detail-notice">
              该岗位发布已超过 30 天，完整 JD 缓存已过期。仍可前往官网确认岗位状态。
            </div>
          ) : (
            <>
              <DetailText title="岗位职责" value={detail?.description} />
              <DetailText title="任职要求" value={detail?.requirement} />
              {!detail?.description && !detail?.requirement && (
                <DetailText
                  title="岗位摘要"
                  value={visibleJob.description_summary}
                />
              )}
            </>
          )}
        </div>

        <div className="detail-footer">
          <a
            href={visibleJob.job_url}
            target="_blank"
            rel="noreferrer"
            className="apply-button"
          >
            前往官网投递
            <ArrowUpRight size={18} />
          </a>
          <span>将在新标签页打开字节招聘官网</span>
        </div>
      </aside>
    </>
  )
}
