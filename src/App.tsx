import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { inspectJob, type JobTimeResponse } from './api'
import { Background } from './components/Background'
import { SearchBar } from './components/SearchBar'
import { ResultCard } from './components/ResultCard'
import { Radar } from 'lucide-react'
import { Analytics } from '@vercel/analytics/react'

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
      setError(err.message || 'EXTRACTION_FAILED: Please check the URL or try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-500/20 selection:text-blue-900 overflow-x-hidden relative flex flex-col antialiased">
      <Background />
      
      <main className="flex-1 flex flex-col items-center px-4 pt-16 pb-24 md:pt-24 relative z-10 w-full">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto w-full mb-12"
        >
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-slate-200/60 text-xs font-semibold text-slate-600 mb-8 tracking-wide shadow-sm backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            系统在线 · 无需登录即用
          </div>
          
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-900 flex flex-col items-center gap-4">
            <Radar className="w-12 h-12 md:w-16 md:h-16 text-blue-500 mb-2" />
            <span className="gradient-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              岗位发布时间提取器
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto tracking-wide">
            很多招聘官网隐藏了发布时间，粘贴岗位链接，我们帮你找出它的真实发布日期，避免把时间浪费在沉寂的岗位上。
            <br className="hidden md:block" />
            <span className="text-sm text-slate-500 font-medium mt-4 block">
              当前支持：飞书类型平台（字节跳动、智谱、影视飓风等）
            </span>
          </p>
        </motion.div>

        <SearchBar 
          url={url} 
          setUrl={setUrl} 
          loading={loading} 
          error={error} 
          onSubmit={handleSubmit} 
        />

        <AnimatePresence mode="wait">
          {result && <ResultCard key={result.job_id || 'result'} data={result} />}
        </AnimatePresence>
      </main>

      <footer className="py-6 text-center mt-auto relative z-10">
        <p className="text-xs font-medium text-slate-400 tracking-wider">
          专为求职者设计 · 效率工具
        </p>
      </footer>
      <Analytics />
    </div>
  )
}

export default App
