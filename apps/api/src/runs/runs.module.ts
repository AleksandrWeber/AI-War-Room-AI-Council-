import { Module } from '@nestjs/common'
import { AgentService } from '../agents/agent.service.js'
import { ArtifactService } from '../artifacts/artifact.service.js'
import { WorkspaceAccessGuard } from '../auth/workspace-access.guard.js'
import { LlmModule } from '../llm/llm.module.js'
import { ModeratorService } from '../moderator/moderator.service.js'
import { ObservabilityModule } from '../observability/observability.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { ResearchModule } from '../research/research.module.js'
import { ShieldModule } from '../shield/shield.module.js'
import {
  TEMPORAL_RUN_CLIENT,
  TemporalSdkRunClient,
} from '../temporal/temporal-run-client.js'
import { TemporalRunService } from '../temporal/temporal-run.service.js'
import { TemporalHealthService } from '../temporal/temporal-health.service.js'
import { TriageService } from '../triage/triage.service.js'
import { UsageModule } from '../usage/usage.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RunsController } from './runs.controller.js'
import { RunsService } from './runs.service.js'

@Module({
  imports: [
    PersistenceModule,
    LlmModule,
    WorkspacesModule,
    UsageModule,
    ObservabilityModule,
    ResearchModule,
    ShieldModule,
  ],
  controllers: [RunsController],
  providers: [
    RunsService,
    TriageService,
    AgentService,
    ModeratorService,
    ArtifactService,
    TemporalRunService,
    TemporalHealthService,
    {
      provide: TEMPORAL_RUN_CLIENT,
      useClass: TemporalSdkRunClient,
    },
    WorkspaceAccessGuard,
  ],
})
export class RunsModule {}
