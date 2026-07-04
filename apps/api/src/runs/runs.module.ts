import { Module } from '@nestjs/common'
import { AgentService } from '../agents/agent.service.js'
import { ArtifactService } from '../artifacts/artifact.service.js'
import { LlmModule } from '../llm/llm.module.js'
import { ModeratorService } from '../moderator/moderator.service.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { TriageService } from '../triage/triage.service.js'
import { RunsController } from './runs.controller.js'
import { RunsService } from './runs.service.js'

@Module({
  imports: [PersistenceModule, LlmModule],
  controllers: [RunsController],
  providers: [RunsService, TriageService, AgentService, ModeratorService, ArtifactService],
})
export class RunsModule {}
