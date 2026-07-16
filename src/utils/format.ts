import dayjs from 'dayjs'

/** Peso currency formatter — the business operates in PHP. */
const peso = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
})

export function formatMoney(value: number | string | null | undefined): string {
  const n = Number(value ?? 0)
  return peso.format(Number.isFinite(n) ? n : 0)
}

/** Compact number for stat tiles when values get large (e.g. ₱1.2M). */
export function formatMoneyCompact(value: number | string | null | undefined): string {
  const n = Number(value ?? 0)
  if (Math.abs(n) >= 1_000_000) return `₱${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `₱${(n / 1_000).toFixed(1)}K`
  return formatMoney(n)
}

export function formatDate(value: string | null | undefined): string {
  return value ? dayjs(value).format('MMM D, YYYY') : '—'
}

export function formatDateTime(value: string | null | undefined): string {
  return value ? dayjs(value).format('MMM D, YYYY h:mm A') : '—'
}

/** Today's date as an ISO date string (form defaults). */
export const todayIso = (): string => dayjs().format('YYYY-MM-DD')
