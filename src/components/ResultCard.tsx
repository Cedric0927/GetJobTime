import { motion } from 'framer-motion'
import { type JobTimeResponse } from '../api'
import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { 
  Building2, 
  Briefcase, 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  AlertCircle, 
  XCircle, 
  ShieldAlert,
  ChevronRight,
  Sparkles
} from 'lucide-react'

const getAdviceConfig = (level: JobTimeResponse['advice_level']) => {
  switch (level) {
    case 'highly_recommended':
      return { color: 'text-emerald-600', border: 'border-emerald-200', bg: 'bg-emerald-50', icon: CheckCircle2, text: '强烈建议投递' }
    case 'recommended':
      return { color: 'text-green-600', border: 'border-green-200', bg: 'bg-green-50', icon: CheckCircle2, text: '建议投递' }
    case 'consider':
      return { color: 'text-blue-600', border: 'border-blue-200', bg: 'bg-blue-50', icon: HelpCircle, text: '可尝试' }
    case 'low_priority':
      return { color: 'text-amber-600', border: 'border-amber-200', bg: 'bg-amber-50', icon: AlertCircle, text: '低优先级' }
    case 'not_recommended':
      return { color: 'text-rose-600', border: 'border-rose-200', bg: 'bg-rose-50', icon: XCircle, text: '不建议优先投入' }
    case 'unknown':
    default:
      return { color: 'text-slate-500', border: 'border-slate-200', bg: 'bg-slate-50', icon: ShieldAlert, text: '未知状态' }
  }
}

export function ResultCard({ data }: { data: JobTimeResponse }) {
  const advice = getAdviceConfig(data.advice_level)
  const AdviceIcon = advice.icon

  const formattedDate = data.publish_time 
    ? format(parseISO(data.publish_time), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })
    : '未提取到发布时间'

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      transition={{ duration: 0.5, type: 'spring', damping: 100, stiffness: 200 }}
      className="w-full max-w-4xl mx-auto mt-12 relative z-10"
    >
      <div className="glass-panel rounded-[2rem] overflow-hidden relative">
        
        {/* Header Section */}
        <div className="p-8 md:p-10 border-b border-slate-200/50 relative">
          <div className="flex flex-col lg:flex-row justify-between gap-6 lg:items-start">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 border border-slate-200/60 shadow-sm">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  {data.site_name || data.host}
                </span>
                {data.job_code && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 border border-slate-200/60 shadow-sm">
                    <Briefcase className="w-4 h-4 text-indigo-500" />
                    ID: {data.job_code}
                  </span>
                )}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight tracking-tight">
                {data.title || '未知岗位名称'}
              </h2>
            </div>
            
            <div className={`flex flex-col items-start lg:items-end gap-2 p-5 rounded-2xl border ${advice.border} ${advice.bg} shadow-sm shrink-0 min-w-[200px]`}>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                系统建议
              </div>
              <div className={`flex items-center gap-2 font-bold text-lg ${advice.color}`}>
                <AdviceIcon className="w-5 h-5" />
                {advice.text}
              </div>
              <div className="text-sm font-medium mt-1 text-slate-600">
                {data.should_apply ? '✓ 值得一试' : '✕ 建议放弃'}
              </div>
            </div>
          </div>
        </div>

        {/* Data Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200/50 border-b border-slate-200/50 bg-white/30">
          <div className="p-8 flex items-start gap-5 transition-colors hover:bg-white/40">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 shadow-inner">
              <CalendarDays className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                发布时间
              </div>
              <div className="font-mono text-xl md:text-2xl text-slate-800 font-medium">
                {formattedDate}
              </div>
            </div>
          </div>
          
          <div className="p-8 flex items-start gap-5 transition-colors hover:bg-white/40">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0 shadow-inner">
              <Clock className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                距今天数
              </div>
              <div className="font-mono text-xl md:text-2xl text-slate-800 font-medium">
                {data.age_days !== undefined ? `${data.age_days} 天前发布` : '未知'}
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Details */}
        <div className="p-8 md:p-10 bg-gradient-to-b from-white/20 to-transparent relative overflow-hidden">
          {/* Subtle tech background inside details */}
          <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
            <Sparkles className="w-96 h-96 text-blue-500" />
          </div>

          <div className="space-y-8 relative z-10">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                投递建议分析
              </h3>
              <p className="text-slate-600 leading-relaxed text-base md:text-lg border-l-4 border-blue-200 pl-5 py-1 bg-blue-50/30 rounded-r-lg">
                {data.advice_reason || '系统暂无建议'}
              </p>
            </div>
            
            {(data.description || data.page_excerpt) && (
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                  岗位摘要
                </h3>
                <div className="p-6 rounded-2xl bg-white/60 border border-slate-200/60 text-base leading-relaxed text-slate-600 relative shadow-sm">
                  <p className="line-clamp-4">
                    {data.description || data.page_excerpt}
                  </p>
                  <a 
                    href={data.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-5 text-blue-600 hover:text-blue-700 hover:underline font-bold text-sm transition-colors"
                  >
                    查看完整详情 <ChevronRight className="w-4 h-4" />
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
