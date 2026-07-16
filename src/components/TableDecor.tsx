import type { ReactNode } from 'react'

/**
 * Small presentational pieces shared by every list view, so the tables across
 * the app stay visually identical (build spec §3).
 */

/** A tinted chip holding a row's entity icon, shown left of the primary cell. */
export function RowIcon({ icon }: { icon: ReactNode }) {
  return (
    <span className="tartar-row-icon" aria-hidden="true">
      {icon}
    </span>
  )
}

/**
 * A primary table cell: entity icon + label. Use for the column that names the
 * row (branch name, payee, username…).
 */
export function NameCell({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="tartar-name-cell">
      <RowIcon icon={icon} />
      <span>{children}</span>
    </span>
  )
}

/**
 * A column heading with a leading icon. The icon is decorative — the text
 * carries the meaning, so it's hidden from assistive tech.
 */
export function ColumnLabel({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="tartar-col-label">
      <span className="tartar-col-icon" aria-hidden="true">
        {icon}
      </span>
      {children}
    </span>
  )
}
