import { Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import type { DraftRun } from '@ai-war-room/schemas'
import { ObservabilityService } from '../observability/observability.service.js'
import { UsageService } from '../usage/usage.service.js'
import { MockResearchProvider } from './mock-research.provider.js'
import type {
  ResearchCitation,
  ResearchProvider,
} from './research.types.js'

type ResearchShieldScan = NonNullable<DraftRun['shieldScan']>

const promptInjectionPattern =
  /ignore (all )?(previous|prior) instructions|system prompt|developer message/i

const secretPattern = /(sk-[a-z0-9_-]{12,}|api[_-]?key|secret|password|token)/i

function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`
}

@Injectable()
export class ResearchService {
  constructor(
    private readonly usageService: UsageService,
    private readonly mockResearchProvider: MockResearchProvider,
    private readonly observabilityService: ObservabilityService,
  ) {}

  async createResearchContext(input: { workspaceId: string; draftRun: DraftRun }) {
    await this.usageService.assertWorkspaceCanUseResearch(input.workspaceId)

    const documents = await this.provider.search({
      draftRun: input.draftRun,
    })
    const scannedDocuments = documents.map((document) => {
      const shieldScan = this.scanRetrievedContent(document.content)

      return {
        ...document,
        shieldScan,
        sanitizedContent:
          shieldScan.findings.length > 0
            ? '[Sanitized research content withheld due to Shield findings.]'
            : document.content,
      }
    })
    const combinedShieldScan = this.combineShieldScans(
      scannedDocuments.map((document) => document.shieldScan),
    )
    const citations = scannedDocuments.map<ResearchCitation>(
      ({ content: _content, sanitizedContent: _sanitizedContent, shieldScan: _scan, ...citation }) =>
        citation,
    )

    this.observabilityService.record('research_context_retrieved', {
      workspaceId: input.workspaceId,
      runId: input.draftRun.runId,
      providerId: this.provider.providerId,
      documentCount: scannedDocuments.length,
      citationCount: citations.length,
      shieldStatus: combinedShieldScan.status,
      findingCount: combinedShieldScan.findings.length,
    })

    return {
      providerId: this.provider.providerId,
      citations,
      documents: scannedDocuments.map((document) => ({
        sourceId: document.sourceId,
        title: document.title,
        url: document.url,
        content: document.sanitizedContent,
      })),
      shieldScan: combinedShieldScan,
    }
  }

  private get provider(): ResearchProvider {
    return this.mockResearchProvider
  }

  private scanRetrievedContent(content: string): ResearchShieldScan {
    const findings: ResearchShieldScan['findings'] = []
    const injectionMatch = promptInjectionPattern.exec(content)
    const secretMatch = secretPattern.exec(content)

    if (injectionMatch) {
      findings.push({
        findingId: createId('finding'),
        severity: 'high',
        category: 'prompt_injection',
        source: 'external_research',
        span: {
          start: injectionMatch.index,
          end: injectionMatch.index + injectionMatch[0].length,
          quote: injectionMatch[0],
        },
        explanation:
          'Retrieved research content contains instructions that could override downstream prompts.',
        recommendedAction: 'redact',
      })
    }

    if (secretMatch) {
      findings.push({
        findingId: createId('finding'),
        severity: 'medium',
        category: 'secrets',
        source: 'external_research',
        span: {
          start: secretMatch.index,
          end: secretMatch.index + secretMatch[0].length,
          quote: secretMatch[0],
        },
        explanation:
          'Retrieved research content appears to contain credential-like material.',
        recommendedAction: 'redact',
      })
    }

    return {
      scanId: createId('scan'),
      status: findings.length > 0 ? 'warning' : 'clear',
      maxSeverity: findings.some((finding) => finding.severity === 'high')
        ? 'high'
        : findings.length > 0
          ? 'medium'
          : 'none',
      findings,
    }
  }

  private combineShieldScans(scans: ResearchShieldScan[]): ResearchShieldScan {
    const findings = scans.flatMap((scan) => scan.findings)

    return {
      scanId: createId('scan'),
      status: findings.length > 0 ? 'warning' : 'clear',
      maxSeverity: findings.some((finding) => finding.severity === 'high')
        ? 'high'
        : findings.length > 0
          ? 'medium'
          : 'none',
      findings,
    }
  }
}
