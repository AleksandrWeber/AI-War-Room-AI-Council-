type RolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

type RolloutSnapshot = {
  status: 'ready' | 'not_ready' | 'disabled'
  guidance: string
  checks: RolloutCheck[]
  checkedAt: string
}

export type RolloutReadinessCardProps = {
  title: string
  rollout: RolloutSnapshot
  formatStatus: (status: RolloutSnapshot['status']) => string
  formatCheckStatus: (status: RolloutCheck['status']) => string
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
