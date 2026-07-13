import type { ShieldFinding, ShieldScanResult } from '@ai-war-room/schemas'

const SENSITIVE_CATEGORIES = new Set(['secrets', 'pii'])

/**
 * Redact sensitive Shield finding payloads before durable PostgreSQL storage.
 * Offsets are kept so UI can still highlight against idea.rawIdea during the run.
 */
export function redactShieldFindingsForPersistence(
  findings: ShieldFinding[],
): ShieldFinding[] {
  return findings.map((finding) => {
    if (!SENSITIVE_CATEGORIES.has(finding.category)) {
      return finding
    }

    return {
      ...finding,
      explanation:
        finding.category === 'secrets'
          ? 'Potential secret detected. Quote redacted at rest.'
          : 'Potential PII detected. Quote redacted at rest.',
      span: finding.span
        ? {
            ...finding.span,
            quote: '[REDACTED]',
          }
        : undefined,
    }
  })
}

export function redactShieldScanForPersistence(
  scan: ShieldScanResult,
): ShieldScanResult {
  return {
    ...scan,
    findings: redactShieldFindingsForPersistence(scan.findings),
  }
}
