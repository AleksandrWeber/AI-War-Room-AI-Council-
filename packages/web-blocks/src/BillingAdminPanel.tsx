import type { ReactNode } from 'react'

export type BillingAdminStatProps = {
  label: string
  value: ReactNode
  detail: ReactNode
}

export function BillingAdminStat({ label, value, detail }: BillingAdminStatProps) {
  return (
    <article className="billing-admin-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  )
}

export type BillingAdminPanelProps = {
  title: string
  panelClassName?: string
  role: string
  guidance: string
  stats: BillingAdminStatProps[]
  children?: ReactNode
}

export function BillingAdminPanel({
  title,
  panelClassName,
  role,
  guidance,
  stats,
  children,
}: BillingAdminPanelProps) {
  return (
    <div className={panelClassName ? `billing-admin ${panelClassName}` : 'billing-admin'}>
      <div className="billing-admin__header">
        <span>{title}</span>
        <strong>{role}</strong>
      </div>
      <p>{guidance}</p>
      <div className="billing-admin__stats">
        {stats.map((stat) => (
          <BillingAdminStat key={stat.label} {...stat} />
        ))}
      </div>
      {children}
    </div>
  )
}
