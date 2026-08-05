import { useEffect, useRef, useState } from 'react'
import { Bookmark, Check, Share2 } from 'lucide-react'

const shareTitle = 'LuckyJob - 只看真正的新岗位'
const shareText =
  '按真实发布时间查看字节跳动社招与校招岗位，还有近期可用内推码。'
const canonicalUrl = 'https://jobinfo.apphome.me/'

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const input = document.createElement('textarea')
  input.value = value
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.appendChild(input)
  input.select()
  document.execCommand('copy')
  input.remove()
}

export function SiteActions() {
  const [notice, setNotice] = useState('')
  const [shared, setShared] = useState(false)
  const noticeTimer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (noticeTimer.current) window.clearTimeout(noticeTimer.current)
    },
    [],
  )

  const showNotice = (message: string) => {
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current)
    setNotice(message)
    noticeTimer.current = window.setTimeout(() => setNotice(''), 3200)
  }

  const handleShare = async () => {
    const shareData = {
      title: shareTitle,
      text: shareText,
      url: canonicalUrl,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        setShared(true)
        showNotice('感谢分享，让更多求职者发现新岗位')
      } else {
        await copyText(shareData.url)
        setShared(true)
        showNotice('页面链接已复制，可以分享给朋友了')
      }

      window.setTimeout(() => setShared(false), 1800)
    } catch (error) {
      if ((error as { name?: string }).name !== 'AbortError') {
        showNotice('分享失败，请复制浏览器地址后重试')
      }
    }
  }

  const handleFavorite = () => {
    const isMobile = window.matchMedia('(max-width: 760px)').matches
    const isApple = /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent)

    if (isMobile) {
      showNotice('请打开浏览器菜单，选择“添加书签”或“收藏”')
      return
    }

    showNotice(`按 ${isApple ? '⌘ + D' : 'Ctrl + D'} 收藏本站，下次找岗位更方便`)
  }

  return (
    <div className="site-actions">
      <button type="button" onClick={handleShare} aria-label="分享 LuckyJob">
        {shared ? <Check size={16} /> : <Share2 size={16} />}
        <span>{shared ? '已分享' : '分享'}</span>
      </button>
      <button type="button" onClick={handleFavorite} aria-label="收藏 LuckyJob">
        <Bookmark size={16} />
        <span>收藏</span>
      </button>

      {notice && (
        <div className="site-action-notice" role="status" aria-live="polite">
          {notice}
        </div>
      )}
    </div>
  )
}
