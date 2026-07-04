import { Injectable } from '@nestjs/common'
import { agentRoleSchema, runStatusSchema } from '@ai-war-room/schemas'

@Injectable()
export class RunsService {
  getCapabilities() {
    return {
      statuses: runStatusSchema.options,
      agentRoles: agentRoleSchema.options,
      flow: [
        'idea_submission',
        'shield_scan',
        'triage',
        'human_review',
        'agent_pool',
        'moderator',
        'artifacts',
      ],
    }
  }
}
