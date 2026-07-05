import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPromptEvaluationRolloutGuidance,
  promptEvaluationCapabilitiesResponseSchema,
  promptEvaluationRolloutResponseSchema,
  promptRegressionAdminActionRequestSchema,
  promptRegressionAdminActionResponseSchema,
  promptRegressionAdminSummaryResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { evaluatePromptEvaluationRollout } from './prompt-evaluation-rollout.helpers.js'
import {
  buildPromptRegressionAdminStats,
  getPromptRegressionAdminGuidance,
  resolvePromptRegressionAdminActions,
  toPromptRegressionAdminCases,
} from './prompt-regression-admin.helpers.js'
import {
  runPromptEvaluation,
  type PromptEvaluationReport,
} from './prompt-evaluation.runner.js'
import { promptRegressionDataset } from './prompt-regression.dataset.js'

@Injectable()
export class EvaluationAdminService {
  private lastReport: PromptEvaluationReport | null = null

  constructor(private readonly configService: ConfigService<ApiEnv, true>) {}

  getCapabilities() {
    return promptEvaluationCapabilitiesResponseSchema.parse({
      supportsPromptEvaluationRollout: true,
      supportsPromptRegressionAdminTools: true,
      regressionDatasetCaseCount: promptRegressionDataset.length,
      guidance: getPromptEvaluationRolloutGuidance(),
    })
  }

  async getPromptEvaluationRollout() {
    const report = await this.runRegressionEvaluation()
    const stats = buildPromptRegressionAdminStats(report)
    const rollout = evaluatePromptEvaluationRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      datasetCaseCount: promptRegressionDataset.length,
      totalCases: report.totalCases,
      passedCases: report.passedCases,
      failedCases: report.failedCases,
      promptVersionDriftCount: stats.promptVersionDriftCount,
      schemaInvalidCount: stats.schemaInvalidCount,
    })

    return promptEvaluationRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePromptRegressionAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePromptRegression(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const report = this.lastReport ?? (await this.runRegressionEvaluation())
    const stats = buildPromptRegressionAdminStats(report)
    const availableActions = resolvePromptRegressionAdminActions({ stats })

    return promptRegressionAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      cases: toPromptRegressionAdminCases(report),
      stats,
      availableActions,
      guidance: getPromptRegressionAdminGuidance({ stats }),
      generatedAt: report.generatedAt,
    })
  }

  async executePromptRegressionAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'rerun_prompt_regression'
    },
  ) {
    this.assertCanManagePromptRegression(authContext)

    const payload = promptRegressionAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'rerun_prompt_regression': {
        const report = await this.runRegressionEvaluation()
        const stats = buildPromptRegressionAdminStats(report)

        return promptRegressionAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message:
            stats.failedCases === 0
              ? `Reran prompt regression for ${stats.totalCases} cases with no failures.`
              : `Reran prompt regression and found ${stats.failedCases} failing case(s).`,
          stats,
        })
      }
    }
  }

  private async runRegressionEvaluation() {
    const report = await runPromptEvaluation()
    this.lastReport = report
    return report
  }

  private assertCanManagePromptRegression(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage prompt regression tools.',
    })
  }
}
