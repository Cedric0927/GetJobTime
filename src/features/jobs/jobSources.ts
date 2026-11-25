import type { JobSourceMetadata, JobStats } from '../../api'

const legacySources: JobSourceMetadata[] = [
  { id: 'bytedance_social', company_id: 'bytedance', company_name: '字节跳动', channel_label: '社招', channel_kind: 'social' },
  { id: 'bytedance_campus', company_id: 'bytedance', company_name: '字节跳动', channel_label: '校招', channel_kind: 'campus' },
]

export function getSourceCatalog(stats: JobStats | null) {
  const metadata = new Map(legacySources.map((source) => [source.id, source]))
  for (const source of stats?.source_catalog ?? []) metadata.set(source.id, source)

  return [...new Set(stats?.sources ?? legacySources.map((source) => source.id))]
    .map((id) => metadata.get(id) ?? {
      id,
      company_id: '',
      company_name: '',
      channel_label: id,
      channel_kind: 'unknown',
    })
}

export function sourceLabel(source?: JobSourceMetadata) {
  return source ? [source.company_name, source.channel_label].filter(Boolean).join(' · ') : '来源待确认'
}
