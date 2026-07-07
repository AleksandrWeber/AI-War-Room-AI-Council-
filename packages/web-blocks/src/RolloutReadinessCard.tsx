export type RolloutReadinessCheck = {
  name: string
  label: string
  status: string
  detail: string
}

export type RolloutReadinessSnapshot = {
  status: string
  guidance: string
  checks: RolloutReadinessCheck[]
  checkedAt: string
}

export type RolloutReadinessCardProps = {
  title: string
  rollout: RolloutReadinessSnapshot
  formatStatus: (status: string) => string
  formatCheckStatus: (status: string) => string
}

export function RolloutReadinessCard({
  title,
  rollout,
  formatStatus,
  formatCheckStatus,
}: RolloutReadinessCardProps) {
  return (
    <div className="billing-rollout">
      <div className="billing-rollout__header">
        <span>{title}</span>
        <strong
          className={`billing-rollout__status billing-rollout__status--${rollout.status}`}
        >
          {formatStatus(rollout.status)}
        </strong>
      </div>
      <p>{rollout.guidance}</p>
      <div className="billing-rollout__checks">
        {rollout.checks.map((check) => (
          <article
            className={`billing-rollout-check billing-rollout-check--${check.status}`}
            key={check.name}
          >
            <strong>{check.label}</strong>
            <span>{formatCheckStatus(check.status)}</span>
            <p>{check.detail}</p>
          </article>
        ))}
      </div>
      <small>Checked at {rollout.checkedAt}</small>
    </div>
  )
}
