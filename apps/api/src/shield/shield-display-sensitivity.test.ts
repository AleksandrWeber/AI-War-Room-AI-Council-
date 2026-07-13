import { describe, expect, it } from 'vitest'
import type { ShieldFinding } from '@ai-war-room/schemas'
import { filterFindingsByDisplaySensitivity } from '@ai-war-room/schemas'

function finding(
  severity: ShieldFinding['severity'],
  findingId: string,
): ShieldFinding {
  return {
    findingId,
    severity,
    category: 'prompt_injection',
    source: 'user_input',
    explanation: 'test',
    recommendedAction: 'warn',
  }
}

describe('filterFindingsByDisplaySensitivity', () => {
  const findings = [
    finding('low', 'low'),
    finding('medium', 'medium'),
    finding('high', 'high'),
    finding('critical', 'critical'),
  ]

  it('keeps medium and above for the default policy', () => {
    expect(
      filterFindingsByDisplaySensitivity(findings, 'medium_and_up').map(
        (item) => item.findingId,
      ),
    ).toEqual(['medium', 'high', 'critical'])
  })

  it('keeps only high and critical for high_only', () => {
    expect(
      filterFindingsByDisplaySensitivity(findings, 'high_only').map(
        (item) => item.findingId,
      ),
    ).toEqual(['high', 'critical'])
  })

  it('keeps all findings when sensitivity is all', () => {
    expect(
      filterFindingsByDisplaySensitivity(findings, 'all').map(
        (item) => item.findingId,
      ),
    ).toEqual(['low', 'medium', 'high', 'critical'])
  })
})
