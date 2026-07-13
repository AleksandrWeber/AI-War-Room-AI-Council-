import type { ShieldDisplaySensitivity } from './workspace-settings-admin.js'
import type { ShieldFinding } from './shield.js'

const severityRank: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
}

export function filterFindingsByDisplaySensitivity(
  findings: ShieldFinding[],
  sensitivity: ShieldDisplaySensitivity,
): ShieldFinding[] {
  const minimum =
    sensitivity === 'all' ? 1 : sensitivity === 'medium_and_up' ? 2 : 3

  return findings.filter((finding) => {
    if (finding.severity === 'critical') {
      return true
    }

    return (severityRank[finding.severity] ?? 0) >= minimum
  })
}
