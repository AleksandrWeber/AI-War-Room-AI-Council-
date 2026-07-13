import { describe, expect, it } from 'vitest'
import { redactShieldFindingsForPersistence } from './shield-persistence-redaction.js'

describe('redactShieldFindingsForPersistence', () => {
  it('redacts secrets and pii quotes while keeping offsets', () => {
    const [secretsFinding, piiFinding, otherFinding] =
      redactShieldFindingsForPersistence([
        {
          findingId: 'finding_secret',
          severity: 'critical',
          category: 'secrets',
          source: 'user_input',
          span: { start: 10, end: 40, quote: 'sk-live-super-secret' },
          explanation: 'Found API key sk-live-super-secret in input.',
          recommendedAction: 'block',
        },
        {
          findingId: 'finding_pii',
          severity: 'high',
          category: 'pii',
          source: 'user_input',
          span: { start: 0, end: 11, quote: '555-0100' },
          explanation: 'Phone number detected.',
          recommendedAction: 'warn',
        },
        {
          findingId: 'finding_injection',
          severity: 'high',
          category: 'prompt_injection',
          source: 'user_input',
          span: { start: 0, end: 20, quote: 'ignore previous instructions' },
          explanation: 'Injection phrasing detected.',
          recommendedAction: 'require_confirmation',
        },
      ])

    expect(secretsFinding.span).toEqual({
      start: 10,
      end: 40,
      quote: '[REDACTED]',
    })
    expect(secretsFinding.explanation).not.toContain('sk-live')
    expect(piiFinding.span?.quote).toBe('[REDACTED]')
    expect(otherFinding.span?.quote).toBe('ignore previous instructions')
  })
})
