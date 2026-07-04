import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { ApiEnv } from '../config/env.js'
import { IdempotencyService } from './idempotency.service.js'
import { InMemoryRunRepository } from './in-memory-run.repository.js'
import { InMemoryTemporalWorkflowRepository } from './in-memory-temporal-workflow.repository.js'
import { PostgresRunRepository } from './postgres-run.repository.js'
import { PostgresTemporalWorkflowRepository } from './postgres-temporal-workflow.repository.js'
import { PostgresService } from './postgres.service.js'
import { RUN_REPOSITORY } from './run.repository.js'
import { StreamEventBufferService } from './stream-event-buffer.service.js'
import { TEMPORAL_WORKFLOW_REPOSITORY } from './temporal-workflow.repository.js'
import { TemporalWorkerHeartbeatService } from '../temporal/temporal-worker-heartbeat.service.js'

@Module({
  providers: [
    PostgresService,
    PostgresRunRepository,
    PostgresTemporalWorkflowRepository,
    IdempotencyService,
    StreamEventBufferService,
    TemporalWorkerHeartbeatService,
    {
      provide: RUN_REPOSITORY,
      inject: [ConfigService, PostgresRunRepository],
      useFactory: (
        configService: ConfigService<ApiEnv, true>,
        postgresRunRepository: PostgresRunRepository,
      ) => {
        return configService.get('NODE_ENV', { infer: true }) === 'test'
          ? new InMemoryRunRepository()
          : postgresRunRepository
      },
    },
    {
      provide: TEMPORAL_WORKFLOW_REPOSITORY,
      inject: [ConfigService, PostgresTemporalWorkflowRepository],
      useFactory: (
        configService: ConfigService<ApiEnv, true>,
        postgresTemporalWorkflowRepository: PostgresTemporalWorkflowRepository,
      ) => {
        return configService.get('NODE_ENV', { infer: true }) === 'test'
          ? new InMemoryTemporalWorkflowRepository()
          : postgresTemporalWorkflowRepository
      },
    },
  ],
  exports: [
    RUN_REPOSITORY,
    TEMPORAL_WORKFLOW_REPOSITORY,
    IdempotencyService,
    PostgresService,
    StreamEventBufferService,
    TemporalWorkerHeartbeatService,
  ],
})
export class PersistenceModule {}
