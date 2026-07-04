import { Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import type { ShieldFinding, ShieldScanResult } from '@ai-war-room/schemas'
import type {
  ShieldClassifier,
  ShieldClassifierInput,
} from './shield-classifier.types.js'

function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`
}

type Rule = {
  pattern: RegExp
  severity: ShieldFinding['severity']
  category: ShieldFinding['category']
  recommendedAction: ShieldFinding['recommendedAction']
  explanation: string
}

const rules: Rule[] = [
  {
    pattern:
      /exfiltrate|steal credentials|dump secrets|leak (api keys|tokens|passwords|secrets)|send (all )?(api keys|tokens|passwords|secrets)|bypass billing/i,
    severity: 'critical',
    category: 'data_exfiltration',
    recommendedAction: 'block',
    explanation:
      'The content appears to request credential theft, data exfiltration, or abuse of billing controls.',
  },
  {
    pattern:
      /ignore (all )?(previous|prior) instructions|reveal (the )?(system prompt|developer message)|show (the )?(system prompt|developer message)|print (the )?(system prompt|developer message)/i,
    severity: 'high',
    category: 'prompt_injection',
    recommendedAction: 'require_confirmation',
    explanation:
      'The content appears to contain instructions that could override the planning pipeline.',
  },
  {
    pattern: /(sk-[a-z0-9_-]{12,}|api[_-]?key|secret|password|token)/i,
    severity: 'medium',
    category: 'secrets',
    recommendedAction: 'warn',
    explanation:
      'The content may contain a secret or credential-like value and should be reviewed.',
  },
]

@Injectable()
export class DeterministicShieldClassifier implements ShieldClassifier {
  readonly classifierId = 'deterministic-shield-fallback/v1'

  async classify(input: ShieldClassifierInput): Promise<ShieldScanResult> {
    const findings = rules.flatMap<ShieldFinding>((rule) => {
      const match = rule.pattern.exec(input.text)

      if (!match) {
        return []
      }

      return [
        {
          findingId: createId('finding'),
          severity: rule.severity,
          category: rule.category,
          source: input.source,
          span: {
            start: match.index,
            end: match.index + match[0].length,
            quote: match[0],
          },
          explanation: rule.explanation,
          recommendedAction: rule.recommendedAction,
        },
      ]
    })
    const maxSeverity = this.getMaxSeverity(findings)

    return {
      scanId: createId('scan'),
      status:
        maxSeverity === 'critical'
          ? 'blocked'
          : findings.length > 0
            ? 'warning'
            : 'clear',
      maxSeverity,
      findings,
    }
  }

  private getMaxSeverity(findings: ShieldFinding[]): ShieldScanResult['maxSeverity'] {
    if (findings.some((finding) => finding.severity === 'critical')) {
      return 'critical'
    }

    if (findings.some((finding) => finding.severity === 'high')) {
      return 'high'
    }

    if (findings.some((finding) => finding.severity === 'medium')) {
      return 'medium'
    }

    if (findings.some((finding) => finding.severity === 'low')) {
      return 'low'
    }

    return 'none'
  }
}
