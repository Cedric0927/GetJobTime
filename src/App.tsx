import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { inspectJob, type JobTimeResponse } from './api'
import { 
  Search, 
  Clock, 
  CalendarDays, 
  Building2, 
  Briefcase, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
  ChevronRight,
  ShieldAlert
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const getAdviceConfig = (level: JobTimeResponse['advice_level']) => {
  switch (level) {
    case 'highly_recommended':
      return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2, text: '强烈建议投递' }
    case 'recommended':
      return { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: CheckCircle2, text: '建议投递' }
    case 'consider':
      return { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', icon: HelpCircle, text: '可尝试' }
    case 'low_priority':
      return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertCircle, text: '低优先级' }
    case 'not_recommended':
      return { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: XCircle, text: '不建议优先投入' }
    case 'unknown':
    default:
      return { color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20', icon: ShieldAlert, text: '未知时间' }
  }
}

function ResultCard({ data }: { data: JobTimeResponse }) {
  const advice = getAdviceConfig(data.advice_level)
  const AdviceIcon = advice.icon

  const formattedDate = data.publish_time 
    ? format(parseISO(data.publish_time), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })
    : '未提取到明确时间'

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-3xl mx-auto mt-8 relative z-10"
    >
      <div className="glass rounded-3xl overflow-hidden shadow-2xl shadow-black/5 dark:shadow-black/40">
        <div className="p-8 md:p-10 border-b border-border/50">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border border-border/50">
                  <Building2 className="w-3.5 h-3.5" />
                  {data.site_name || data.host}
                </span>
                {data.job_code && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border border-border/50">
                    <Briefcase className="w-3.5 h-3.5" />
                    {data.job_code}
                  </span>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
                {data.title || '未知岗位名称'}
              </h2>
            </div>
            
            <div className={`flex flex-col items-end gap-2 px-4 py-3 rounded-2xl border ${advice.border} ${advice.bg} shrink-0`}>
              <div className={`flex items-center gap-2 font-semibold ${advice.color}`}>
                <AdviceIcon className="w-5 h-5" />
                {advice.text}
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                {data.should_apply ? '值得一试' : '建议放弃'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border/50">
              <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shadow-sm shrink-0">
                <CalendarDays className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground font-medium mb-0.5">发布时间</div>
                <div className="font-semibold text-foreground">{formattedDate}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border/50">
              <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shadow-sm shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground font-medium mb-0.5">距今天数</div>
                <div className="font-semibold text-foreground">
                  {data.age_days !== undefined ? `${data.age_days} 天前发布` : '未知'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10 bg-secondary/20">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">投递建议</h3>
              <p className="text-foreground leading-relaxed">
                {data.advice_reason || '系统暂无建议'}
              </p>
            </div>
            
            {(data.description || data.requirement) && (
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">岗位摘要</h3>
                <div className="p-5 rounded-2xl bg-background border border-border/50 text-sm leading-relaxed text-muted-foreground relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                  <p className="line-clamp-4">
                    {data.description || data.page_excerpt}
                  </p>
                  <a 
                    href={data.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-primary hover:underline font-medium transition-colors"
                  >
                    查看完整详情 <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<JobTimeResponse | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    try {
      setLoading(true)
      setError('')
      setResult(null)
      
      const data = await inspectJob(url.trim())
      setResult(data)
    } catch (err: any) {
      setError(err.message || '获取失败，请检查链接或稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-noise bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary overflow-x-hidden relative flex flex-col">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      
      <main className="flex-1 flex flex-col items-center px-4 pt-20 pb-24 md:pt-32 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto w-full mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-xs font-medium text-muted-foreground mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            无需登录 · 即用即开
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground">
            岗位发布时间提取器
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed balance-text max-w-xl mx-auto">
            很多招聘官网隐藏了发布时间，粘贴岗位链接，我们帮你找出它的真实发布日期，避免把时间浪费在沉寂的岗位上。<br /><br />
            目前只支持飞书类型如字节跳动、智谱、影视飓风的岗位链接，获取失败或者非飞书网站可以留言许愿哦~
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="w-full max-w-2xl mx-auto relative z-20"
        >
          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-[2rem] blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative flex items-center bg-card border border-border/50 rounded-[1.75rem] shadow-xl p-2 transition-all focus-within:ring-2 focus-within:ring-primary/20">
              <div className="pl-4 pr-2 text-muted-foreground">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://jobs.bytedance.com/..."
                className="flex-1 bg-transparent border-none outline-none py-4 px-2 text-base md:text-lg placeholder:text-muted-foreground/60 w-full"
                required
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="ml-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-4 rounded-2xl font-medium transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>提取中...</span>
                  </>
                ) : (
                  <span>提取时间</span>
                )}
              </button>
            </div>
          </form>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence mode="wait">
          {result && <ResultCard key={result.job_id || 'result'} data={result} />}
        </AnimatePresence>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/40 mt-auto relative z-10">
        <p>专为求职者设计 · 效率工具</p>
      </footer>
    </div>
  )
}

export default App
