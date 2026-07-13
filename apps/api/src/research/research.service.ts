import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import type { DraftRun } from '@ai-war-room/schemas'
import { ObservabilityService } from '../observability/observability.service.js'
import { AdvancedShieldService } from '../shield/advanced-shield.service.js'
import { UsageService } from '../usage/usage.service.js'
import type {
  ResearchCitation,
  ResearchProvider,
} from './research.types.js'
import { RESEARCH_PROVIDER } from './research.types.js'

type ResearchShieldScan = NonNullable<DraftRun['shieldScan']>

function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`
}

@Injectable()
export class ResearchService {
  constructor(
    private readonly usageService: UsageService,
    @Inject(RESEARCH_PROVIDER)
    private readonly provider: ResearchProvider,
    private readonly observabilityService: ObservabilityService,
    private readonly advancedShieldService: AdvancedShieldService,
  ) {}

  async createResearchContext(input: { workspaceId: string; draftRun: DraftRun }) {
    await this.usageService.assertWorkspaceCanUseResearch(input.workspaceId)

    const documents = await this.provider.search({
      draftRun: input.draftRun,
    })
    const scannedDocuments = await Promise.all(
      documents.map(async (document) => {
        const shieldScan = await this.advancedShieldService.scanText({
          workspaceId: input.workspaceId,
          runId: input.draftRun.runId,
          text: document.content,
          source: 'external_research',
        })

        return {
          ...document,
          shieldScan,
          sanitizedContent:
            shieldScan.findings.length > 0
              ? '[Sanitized research content withheld due to Shield findings.]'
              : document.content,
        }
      }),
    )
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
      providerId:
        scannedDocuments[0]?.provider ?? this.provider.providerId,
      documentCount: scannedDocuments.length,
      citationCount: citations.length,
      shieldStatus: combinedShieldScan.status,
      findingCount: combinedShieldScan.findings.length,
    })

    return {
      providerId: scannedDocuments[0]?.provider ?? this.provider.providerId,
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
