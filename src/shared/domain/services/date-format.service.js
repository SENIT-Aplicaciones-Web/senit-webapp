export function toDate(value) {
  if (!value) return null
  return value instanceof Date ? value : new Date(value)
}

export function formatDateTime(value) {
  const date = toDate(value)
  if (!date || Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date).replace(',', '')
}

export function formatDate(value) {
  const date = toDate(value)
  if (!date || Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  }).format(date)
}

export function formatTime(value) {
  const date = toDate(value)
  if (!date || Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date)
}

export function addHours(date, hours) {
  const next = new Date(date)
  next.setHours(next.getHours() + Number(hours || 0))
  return next
}

export function isSameDay(firstValue, secondValue = new Date()) {
  const first = toDate(firstValue)
  const second = toDate(secondValue)
  if (!first || !second) return false

  return first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
}

export function getRemainingMilliseconds(targetValue, nowValue = new Date()) {
  const target = toDate(targetValue)
  const now = toDate(nowValue)
  if (!target || !now) return 0
  return target.getTime() - now.getTime()
}

export function formatRemainingTime(milliseconds) {
  const isExpired = milliseconds < 0
  const totalSeconds = Math.abs(Math.floor(milliseconds / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const parts = []
  if (days) parts.push(`${days}d`)
  parts.push(`${String(hours).padStart(2, '0')}h`)
  parts.push(`${String(minutes).padStart(2, '0')}m`)
  parts.push(`${String(seconds).padStart(2, '0')}s`)

  return `${isExpired ? 'Vencida hace ' : ''}${parts.join(' ')}`
}

export function formatCompactRemainingTime(milliseconds) {
  const isExpired = milliseconds < 0
  const totalSeconds = Math.abs(Math.floor(milliseconds / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (days > 0) return `${isExpired ? '-' : ''}${days}d ${hours}h`
  if (hours > 0) return `${isExpired ? '-' : ''}${hours}h ${minutes}m`
  return `${isExpired ? '-' : ''}${minutes}m`
}
