import { Injectable } from '@nestjs/common'
import {
  type AgentChunkSummary,
  type AgentExecutionResult,
  agentChunkSummaryListSchema,
} from '@ai-war-room/schemas'

const MAX_ITEMS = 5

/**
 * Spec Step 9: deterministic map-reduce compression before Moderator.
 * Keeps token cost low and mitigates lost-in-the-middle without an extra LLM hop.
 */
@Injectable()
export class ChunkSummaryService {
  summarizeAgentOutputs(
    agentOutputs: AgentExecutionResult[],
  ): AgentChunkSummary[] {
    const summaries = agentOutputs.map((agent) => {
      const securityNotes =
        agent.shieldScan?.findings
          .filter(
            (finding) =>
              finding.severity === 'high' || finding.severity === 'critical',
          )
          .map((finding) => `${finding.category}: ${finding.explanation}`)
          .slice(0, MAX_ITEMS) ?? []

      const weaknesses = agent.output.weaknesses.slice(0, 3)
      const strengths = agent.output.strengths.slice(0, 3)
      const conflicts =
        weaknesses.length > 0 && strengths.length > 0
          ? [
              `${agent.agentRole}: strengths emphasize ${strengths[0]}; weaknesses note ${weaknesses[0]}`,
            ]
          : []

      return {
        agentRole: agent.agentRole,
        summary: agent.output.summary,
        topInsights: [...strengths, ...agent.output.recommendations].slice(
          0,
          MAX_ITEMS,
        ),
        topRisks: agent.output.risks.slice(0, MAX_ITEMS),
        conflicts,
        recommendedDecisions: agent.output.recommendations.slice(0, MAX_ITEMS),
        securityNotes,
      }
    })

    return agentChunkSummaryListSchema.parse(summaries)
  }
}
