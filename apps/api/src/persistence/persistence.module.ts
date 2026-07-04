import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { ApiEnv } from '../config/env.js'
import { IdempotencyService } from './idempotency.service.js'
import { InMemoryRunRepository } from './in-memory-run.repository.js'
import { PostgresRunRepository } from './postgres-run.repository.js'
import { PostgresService } from './postgres.service.js'
import { RUN_REPOSITORY } from './run.repository.js'

@Module({
  providers: [
    PostgresService,
    PostgresRunRepository,
    IdempotencyService,
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
  ],
  exports: [RUN_REPOSITORY, IdempotencyService, PostgresService],
})
export class PersistenceModule {}
