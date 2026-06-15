import { ChevronLeft, ChevronRight, Inbox, LoaderCircle } from 'lucide-react'
import type { JobListItem } from '../../api'

interface JobListProps {
  items: JobListItem[]
  selectedId?: string
  loading: boolean
  error: string
  page: number
  pageSize: number
  total: number
  onSelect: (job: JobListItem) => void
  onPageChange: (page: number) => void
  onRetry: () => void
}

function freshnessLabel(job: JobListItem) {
  if (job.age_days <= 0) return '今天发布'
  if (job.age_days === 1) return '昨天发布'
  return `${job.age_days}天前`
}

export function JobList({
  items,
  selectedId,
  loading,
  error,
  page,
  pageSize,
  total,
  onSelect,
  onPageChange,
  onRetry,
}: JobListProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <section className="job-list-panel" aria-label="岗位列表">
      <div className="job-table-head" aria-hidden="true">
        <span>职位信息</span>
        <span>地点</span>
        <span>招聘类型</span>
        <span>发布时间</span>
      </div>

      {loading && items.length === 0 ? (
        <div className="state-box">
          <LoaderCircle className="spin" size={26} />
          <strong>正在获取最新岗位</strong>
          <span>数据会按照真实发布时间排序</span>
        </div>
      ) : error ? (
        <div className="state-box">
          <Inbox size={28} />
          <strong>岗位加载失败</strong>
          <span>{error}</span>
          <button type="button" onClick={onRetry}>
            重新加载
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="state-box">
          <Inbox size={30} />
          <strong>这个时间段暂时没有匹配岗位</strong>
          <span>真实的空结果也很重要，可以放宽时间或筛选条件。</span>
        </div>
      ) : (
        <div className={loading ? 'job-rows is-refreshing' : 'job-rows'}>
          {items.map((job) => (
            <button
              type="button"
              key={job.id}
              className={selectedId === job.id ? 'job-row is-selected' : 'job-row'}
              onClick={() => onSelect(job)}
            >
              <span className="job-main">
                <span className="job-title-line">
                  <strong>{job.title}</strong>
                  <span
                    className={
                      job.source === 'bytedance_campus'
                        ? 'source-badge campus'
                        : 'source-badge'
                    }
                  >
                    {job.source === 'bytedance_campus' ? '校招' : '社招'}
                  </span>
                </span>
                <span className="job-department">{job.department || '字节跳动'}</span>
                <span className="job-summary">
                  {job.description_summary || '查看岗位详情与任职要求'}
                </span>
              </span>
              <span className="job-location">{job.location_name || '地点待定'}</span>
              <span className="job-type">{job.recruitment_type || '招聘岗位'}</span>
              <span className={`freshness ${job.freshness_bucket}`}>
                <i />
                {freshnessLabel(job)}
              </span>
              <ChevronRight className="job-chevron" size={18} aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      {total > 0 && (
        <div className="pagination">
          <span>
            共 {total.toLocaleString('zh-CN')} 个岗位
          </span>
          <div>
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange(page - 1)}
              aria-label="上一页"
            >
              <ChevronLeft size={17} />
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => onPageChange(page + 1)}
              aria-label="下一页"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
