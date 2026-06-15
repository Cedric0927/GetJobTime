# JobTime API 文档（前端用）

> 基础路径: `https://api.apphome.me/api/v1/apps/jobtime`
> 鉴权：除 `health`、`jobs`、`jobs/filters`、`jobs/stats`、`jobs/{id}`、`inspect` 外，其余端点需要
> `X-API-Key: <key>` 头（key 在 `/etc/canvas-design.env` 的 `API_KEYS`）。
>
> 时间字段统一为 ISO-8601 UTC（`2026-06-15T03:00:00.000000Z`）。
> 所有分页参数：`page` ≥ 1、`page_size` 1-100。

---

## 数据来源

`s source` 字段标识岗位来源：

| 值 | 含义 | portal_type | 入口 |
|---|---|---|---|
| `bytedance_social` | 字节社招 | 2 | `jobs.bytedance.com/experienced/position` |
| `bytedance_campus` | 字节校招 | 1 | `jobs.bytedance.com/campus/position` |

`/jobs`、`/jobs/filters`、`/jobs/stats` 默认查所有 source，可通过 `?source=` 过滤。
`/sync/bytedance` 每次只同步一个 portal（`portal_type` 字段选 1/2）。

JD 缓存：岗位 `publish_time` 在 30 天内的，`description` / `requirement` 才返回；
30 天之外的只返回 `description_summary`（前 240 字）。前端不用再过滤 JD 是否可见——直接看 `jd_visible` 字段。

---

## 1. 健康检查

```
GET /health
```

无需鉴权。返回 `{"status": "ok"}`。

---

## 2. 数据健康（增量同步是否正常）

```
GET /jobs/health
```

**Response**
```json
{
  "healthy": true,
  "last_success_at": "2026-06-15T03:30:00Z",
  "last_success_age_seconds": 42,
  "stale_threshold_seconds": 7200,
  "sources": ["bytedance_social", "bytedance_campus"]
}
```

`healthy=false` 意味着最后一次成功的 sync 已超过 `stale_threshold_seconds`（默认 2 小时）。

---

## 3. 全局统计

```
GET /jobs/stats
```

**Response**
```json
{
  "sources": ["bytedance_social", "bytedance_campus"],
  "fresh_1_days": 12,        // 1 天内新发岗位数（按 publish_time）
  "fresh_3_days": 38,
  "fresh_7_days": 167,
  "fresh_30_days": 943,
  "total_active": 5649,      // 所有 active 状态岗位
  "last_sync_at": "2026-06-15T03:30:00Z",
  "last_sync_status": "success"
}
```

---

## 4. 岗位列表（主接口）

```
GET /jobs
```

**Query 参数**

| 名称 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `fresh_days` | int 1-30 | 否 | 只看最近 N 天发布的岗位（按 `publish_time`） |
| `keyword` | str ≤100 | 否 | 模糊匹配标题/摘要；`fresh_days≤30` 时还匹配 description/requirement |
| `category_id` | str | 否 | 职位类目 ID（从 `/jobs/filters` 取） |
| `location_code` | str | 否 | 工作城市代码 |
| `recruitment_type` | str | 否 | 招聘类型（社招/校招/实习等） |
| `source` | str | 否 | `bytedance_social` / `bytedance_campus`，不传则查全部 |
| `page` | int ≥1 | 否，默认 1 | |
| `page_size` | int 1-100 | 否，默认 20 | |

**Response**
```json
{
  "items": [
    {
      "id": "uuid",                          // 内部 ID（详情接口用）
      "source": "bytedance_social",
      "external_job_id": "7494870018459846919",  // 字节官方 ID
      "title": "高级后端工程师",
      "job_url": "https://jobs.bytedance.com/experienced/position/7494870018459846919/detail",
      "job_code": "A12345",
      "description_summary": "负责...",
      "category_id": "cat-product",
      "category_name": "产品",
      "location_code": "city-bj",
      "location_name": "北京",
      "department": "抖音",
      "recruitment_type": "社招",
      "publish_time": "2026-06-13T08:00:00Z",
      "publish_timestamp_ms": 1749800000000,
      "age_days": 1,
      "freshness_bucket": "3d",               // 1d / 3d / 7d / 30d / older
      "status": "active"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 943,
  "fresh_days": 30
}
```

排序：`publish_time DESC, first_seen_at DESC`。
**空结果可能真实存在**——按发布时间严格过滤，没有就返回空数组，不要 fallback。

---

## 5. 列表过滤器选项

```
GET /jobs/filters?fresh_days=30&source=bytedance_social
```

**Response**
```json
{
  "categories":      [{"id": "cat-product", "name": "产品", "count": 88}],
  "locations":       [{"id": "city-bj",    "name": "北京", "count": 421}],
  "recruitment_types": [{"id": "社招",       "name": "社招", "count": 5500}]
}
```

带 `fresh_days` 时只统计窗口内的值。建议用户切换时间段时同步刷新此接口。

---

## 6. 岗位详情

```
GET /jobs/{post_id}
```

`post_id` 是列表接口返回的 `id`（UUID）。**不是** `external_job_id`。

**Response**

继承 `JobListItem`，额外加：
```json
{
  "description": "岗位职责：\n1. ...",   // publish_time > 30 天时为 null
  "requirement": "任职要求：\n1. ...",
  "jd_visible": true,                  // false 时 description/requirement 都为 null
  "jd_cached_until": "2026-07-13T08:00:00Z"
}
```

`jd_visible=false` 的岗位展示「JD 已过期」并直接引导到 `job_url` 投递即可。

---

## 7. 抓取任意 URL 的发布时间（调试用）

```
POST /inspect
Content-Type: application/json

{"url": "https://jobs.bytedance.com/experienced/position/7494870018459846919/detail"}
```

URL 路径含 `/campus/` 自动用校招 portal_type=1；其他默认 2（社招）。

**Response**
```json
{
  "url": "...",
  "host": "jobs.bytedance.com",
  "site_name": "ByteDance Jobs",
  "job_id": "7494870018459846919",
  "title": "...",
  "publish_time": "2026-06-13T08:00:00Z",
  "publish_timestamp_ms": 1749800000000,
  "age_days": 1,
  "should_apply": true,
  "advice_level": "highly_recommended",   // 1d/3d/7d/30d/older
  "advice_reason": "发布时间在 3 天内...",
  "extractor": "bytedance_job_posts_api",
  "confidence": "high",
  "job_info": { ... }                    // 原始 payload
}
```

---

## 8. 触发一次同步（需要 API Key）

```
POST /sync/bytedance
X-API-Key: <key>
Content-Type: application/json

{
  "portal_type": 2,            // 1=校招 2=社招
  "max_pages": 5,
  "page_size": 50,
  "max_new_details": 20,
  "mark_missing": true,        // 标记多次没出现的岗位为 closed_or_unknown
  "missing_threshold": 3
}
```

**Response**
```json
{
  "id": "uuid",
  "source": "bytedance_social",
  "started_at": "...",
  "finished_at": null,         // 同步完成后回填
  "status": "running",         // running / success / failed
  "scanned_count": 0,
  "new_count": 0,
  "updated_count": 0,
  "missing_count": 0,
  "error_message": null
}
```

同步是同步阻塞的（数秒到一两分钟），不推荐前端直接调用。后台调度器每 30 分钟跑一次。

---

## 9. 一次性全量回填（需要 API Key）

```
POST /sync/bytedance/backfill
X-API-Key: <key>
Content-Type: application/json

{
  "max_pages": 400,
  "page_size": 50,
  "max_details": 2000
}
```

异步：返回 `run_id`，后台线程跑 phase1（扫列表）+ phase2（补详情）。默认同步社招。

**Response**
```json
{
  "run_id": "uuid",
  "status": "running",
  "started_at": "...",
  "accepted": true
}
```

---

## 10. 查询同步运行详情（需要 API Key）

```
GET /sync/bytedance/runs/{run_id}
X-API-Key: <key>
```

**Response**
```json
{
  "id": "uuid",
  "source": "bytedance_social",
  "started_at": "...",
  "finished_at": "...",
  "status": "success",
  "scanned_count": 250,
  "new_count": 12,
  "updated_count": 238,
  "missing_count": 0,
  "error_message": null,
  "raw_meta": {
    "mode": "incremental",
    "start_page": 0,
    "max_pages": 5,
    "page_size": 50,
    "new_detail_count": 12
  }
}
```

`raw_meta.mode` ∈ `incremental` / `backfill` / `startup_backfill`。
`raw_meta.phase` 1=扫列表阶段，2=补详情阶段。

---

## 11. 同步机制（前端无需关心）

- 调度器：进程内 1Hz 轮询
- 增量同步：每 30 分钟一次，扫前 5 页（250 个）社招+校招各自
- 详情队列：每 5 分钟一次，给 30 天内 `description` 为空的 active 岗位补详情
- 启动回填：进程启动时如果 `jobtime_posts` 为空，跑一次全量；已有数据则跳过
- Bot UA：`JobTimeBot/1.0 (+mailto:cedric.jc@outlook.com)`（来自 `JOBTIME_BOT_CONTACT`）
- 限速：列表 5 req/s，详情 3 req/s，同 host 串行

---

## 12. 前端建议

| 场景 | 接口 |
|---|---|
| 默认页（最新岗位） | `GET /jobs?page_size=20&fresh_days=7` |
| 时间段切换（1d/3d/7d/30d） | 同一个 `/jobs` 改 `fresh_days`，同步刷 `/jobs/filters` |
| 社招/校招切换 | `/jobs?source=bytedance_social` 或 `bytedance_campus` |
| 卡片打开看 JD | `GET /jobs/{id}` |
| 统计页头数字 | `GET /jobs/stats` |
| 投递按钮 | 跳卡片里的 `job_url`（已包含详情页锚点） |
| 报错时排查 | `GET /jobs/health` 配合 `last_success_at` |
