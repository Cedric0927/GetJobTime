export interface JobTimeResponse {
  url: string
  host: string
  site_name: string
  job_id: string
  title: string
  job_code: string
  description: string
  requirement: string
  publish_timestamp_ms: number
  publish_time: string
  age_days: number
  should_apply: boolean
  advice_level: 'highly_recommended' | 'recommended' | 'consider' | 'low_priority' | 'not_recommended' | 'unknown'
  advice_reason: string
  extractor: string
  matched_field: string
  confidence: string
  page_excerpt: string
  job_info?: any
}

export async function inspectJob(url: string): Promise<JobTimeResponse> {
  const resp = await fetch("https://api.apphome.me/api/v1/apps/jobtime/inspect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      requestId: crypto.randomUUID(),
    }),
  });

  const data = await resp.json();

  if (!resp.ok) {
    throw new Error(data?.error?.message || "请求失败");
  }

  return data;
}