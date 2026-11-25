import { useEffect, useState, type CSSProperties } from 'react'
import towerPhoto from '../assets/offer-tower.png'
import './offer-tower.css'

const storageKey = 'luckyjob.offer.count'
const dailyKey = 'luckyjob.offer.daily'
const localDate = new Intl.DateTimeFormat('sv-SE')
let sessionCount = 0
let sessionDaily = { date: '', count: 0 }
const stages = [
  { at: 0, name: '夜色初临', color: '#8aaaff' },
  { at: 1, name: '为你亮灯', color: '#76dfff' },
  { at: 5, name: '通体鎏金', color: '#ffcf73' },
  { at: 15, name: '紫气入云', color: '#cb97ff' },
  { at: 30, name: '极光加冕', color: '#80ffcf' },
]
const wishes = ['简历被看见', '面试有回音', '终面稳稳过', '好消息在路上']

function readCount() {
  try {
    const value = Number(localStorage.getItem(storageKey))
    return Number.isSafeInteger(value) && value >= 0 && value < 1e9 ? Math.max(value, sessionCount) : sessionCount
  } catch { return sessionCount }
}

function readDaily(date: string) {
  const fallback = sessionDaily.date === date ? sessionDaily.count : 0
  try {
    const saved = JSON.parse(localStorage.getItem(dailyKey) ?? 'null')
    if (saved?.date === date && Number.isSafeInteger(saved.count) && saved.count >= 0) {
      return Math.max(saved.count, fallback)
    }
  } catch {
    return fallback
  }
  return fallback
}

export function OfferTower({ onExit }: { onExit: () => void }) {
  const [count, setCount] = useState(readCount)
  const [today, setToday] = useState(() => readDaily(localDate.format()))
  const [played, setPlayed] = useState(false)
  const level = stages.reduce((current, stage, index) => count >= stage.at ? index : current, 0)
  const stage = stages[level]
  const next = stages[level + 1]
  const milestone = played && count === stage.at
  const wish = milestone ? `解锁 · ${stage.name}` : wishes[(count - 1) % wishes.length]

  useEffect(() => {
    const refresh = () => setToday(readDaily(localDate.format()))
    const timer = window.setInterval(refresh, 1000)
    window.addEventListener('focus', refresh)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  function cast() {
    const date = localDate.format()
    sessionCount = Math.max(count, readCount()) + 1
    sessionDaily = { date, count: readDaily(date) + 1 }
    setCount(sessionCount)
    setToday(sessionDaily.count)
    setPlayed(true)
    try {
      localStorage.setItem(storageKey, String(sessionCount))
      localStorage.setItem(dailyKey, JSON.stringify(sessionDaily))
    } catch { return }
  }

  return (
    <main className="offer-tower" style={{ '--tower': stage.color } as CSSProperties}>
      <div className="offer-topbar">
        <button type="button" onClick={onExit}>← 返回岗位</button>
        <span>北京国贸 / 中国尊</span>
      </div>
      <div className="offer-heading"><span>LUCKYJOB / 好运事务所</span><h1>拜 Offer 大楼</h1><p>把等待回音的心情，点亮一盏灯。</p></div>
      <div className={`offer-scene offer-level-${level}`} style={{ '--lit-height': `${100 - Math.min(100, count * 6 + level * 9)}%` } as CSSProperties}>
        <img className="offer-photo" src={towerPhoto} width="1536" height="1024" alt="北京国贸蓝调时刻，从街面仰望中国尊" />
        <div className="offer-facade" aria-hidden="true" />
        {level >= 3 && <div className="offer-aurora" aria-hidden="true" />}
        {level === 4 && <div className="offer-halo" aria-hidden="true" />}
        {played && <div key={count} className={`offer-burst ${milestone ? 'offer-milestone' : ''}`} aria-hidden="true">
          <i className="offer-flare"/><i className="offer-ring"/><i className="offer-ring offer-ring-late"/>
          {Array.from({ length: milestone ? 36 : 16 }, (_, index) => {
            const angle = index * 2.39996
            const radius = 65 + (index * 37) % (milestone ? 150 : 88)
            return <i key={index} className="offer-spark" style={{ '--dx': `${Math.cos(angle) * radius}px`, '--dy': `${Math.sin(angle) * radius}px`, '--delay': `${index % 5 * 23}ms` } as CSSProperties}/>
          })}
          <strong className="offer-wish">{wish}</strong>
        </div>}
      </div>
      <div className="offer-controls">
        <div className="offer-stage">当前楼态 <strong>{stage.name}</strong></div>
        <button type="button" onClick={cast}>✦ 拜一下，接 Offer</button>
        <div role="status">
          <p className="offer-counts"><span>今日 <strong>{today}</strong> 次</span><span>累计 <strong>{count}</strong> 次</span></p>
          <p>{next ? `再拜 ${next.at - count} 次解锁「${next.name}」` : '全部楼态已解锁'}{played && ` · ${wish}`}</p>
        </div>
        <small>求职彩蛋 · 次数保存在当前浏览器</small>
      </div>
    </main>
  )
}
