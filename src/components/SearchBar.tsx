import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, AlertCircle, Link as LinkIcon } from 'lucide-react'

interface SearchBarProps {
  url: string
  setUrl: (url: string) => void
  loading: boolean
  error: string
  onSubmit: (e: React.FormEvent) => void
}

export function SearchBar({ url, setUrl, loading, error, onSubmit }: SearchBarProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 100 }}
      className="w-full max-w-3xl mx-auto relative z-20"
    >
      <form onSubmit={onSubmit} className="relative group">
        {/* Glow effect behind the input */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-500"></div>
        
        {/* Input container */}
        <div className="relative flex items-center bg-white/90 backdrop-blur-xl border border-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-2 transition-all focus-within:shadow-[0_8px_40px_rgba(59,130,246,0.15)] focus-within:border-blue-200">
          <div className="pl-5 pr-2 text-slate-400">
            <LinkIcon className="w-5 h-5 text-blue-500" />
          </div>
          
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="粘贴岗位链接，如 https://jobs.bytedance.com/..."
            className="flex-1 bg-transparent border-none outline-none py-4 px-2 text-base md:text-lg text-slate-700 placeholder:text-slate-400 w-full"
            required
            disabled={loading}
          />
          
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="ml-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none px-8 py-4 rounded-xl font-bold tracking-wide transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>提取中...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>解析时间</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 flex items-center justify-center gap-3 text-sm text-slate-500">
        <span>不知道填什么？试试：</span>
        <button 
          type="button"
          onClick={() => setUrl('https://jobs.bytedance.com/experienced/position/7494870018459846919/detail')}
          className="px-4 py-1.5 rounded-full bg-white/60 border border-slate-200 hover:bg-white hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all flex items-center gap-1.5 font-medium"
        >
          字节跳动岗位示例
        </button>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mt-6 overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-red-50/80 backdrop-blur-md border border-red-100 text-red-600 flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <div>
                <div className="font-bold mb-1">提取失败</div>
                <div className="text-sm opacity-90">{error}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
