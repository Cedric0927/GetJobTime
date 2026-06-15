import {
  BriefcaseBusiness,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import type {
  JobFiltersResponse,
  JobSource,
} from '../../api'

export interface JobFilterState {
  keyword: string
  freshDays: number
  source: '' | JobSource
  locationCode: string
  categoryId: string
}

interface JobFiltersProps {
  value: JobFilterState
  options: JobFiltersResponse | null
  loading: boolean
  onChange: (next: JobFilterState) => void
}

const freshDayOptions = [
  { value: 1, label: '24小时内' },
  { value: 3, label: '3天内' },
  { value: 7, label: '7天内' },
  { value: 14, label: '14天内' },
  { value: 30, label: '30天内' },
]

export function JobFilters({
  value,
  options,
  loading,
  onChange,
}: JobFiltersProps) {
  const update = <K extends keyof JobFilterState>(
    key: K,
    next: JobFilterState[K],
  ) => onChange({ ...value, [key]: next })

  const reset = () =>
    onChange({
      keyword: '',
      freshDays: 30,
      source: '',
      locationCode: '',
      categoryId: '',
    })

  return (
    <section className="filter-panel" aria-label="岗位筛选">
      <label className="search-control">
        <Search size={18} aria-hidden="true" />
        <input
          value={value.keyword}
          onChange={(event) => update('keyword', event.target.value)}
          placeholder="搜索职位名称、团队或关键词"
          aria-label="搜索岗位"
        />
      </label>

      <label className="select-control primary-select">
        <span className="sr-only">发布时间</span>
        <select
          value={value.freshDays}
          onChange={(event) => update('freshDays', Number(event.target.value))}
        >
          {freshDayOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="select-control">
        <BriefcaseBusiness size={17} aria-hidden="true" />
        <span className="sr-only">招聘来源</span>
        <select
          value={value.source}
          onChange={(event) =>
            update('source', event.target.value as JobFilterState['source'])
          }
        >
          <option value="">全部岗位</option>
          <option value="bytedance_social">社招岗位</option>
          <option value="bytedance_campus">校招岗位</option>
        </select>
      </label>

      <label className="select-control">
        <MapPin size={17} aria-hidden="true" />
        <span className="sr-only">工作城市</span>
        <select
          value={value.locationCode}
          disabled={loading}
          onChange={(event) => update('locationCode', event.target.value)}
        >
          <option value="">全部城市</option>
          {options?.locations.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name} ({option.count})
            </option>
          ))}
        </select>
      </label>

      <label className="select-control">
        <SlidersHorizontal size={17} aria-hidden="true" />
        <span className="sr-only">职位类别</span>
        <select
          value={value.categoryId}
          disabled={loading}
          onChange={(event) => update('categoryId', event.target.value)}
        >
          <option value="">全部职类</option>
          {options?.categories.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name} ({option.count})
            </option>
          ))}
        </select>
      </label>

      <button type="button" className="reset-button" onClick={reset}>
        <RotateCcw size={16} aria-hidden="true" />
        清空筛选
      </button>
    </section>
  )
}
