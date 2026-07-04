import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { ApiEnv } from '../config/env.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { InMemoryUsageRepository } from './in-memory-usage.repository.js'
import { PostgresUsageRepository } from './postgres-usage.repository.js'
import { UsageService } from './usage.service.js'
import { USAGE_REPOSITORY } from './usage.repository.js'

@Module({
  imports: [PersistenceModule],
  providers: [
    PostgresUsageRepository,
    UsageService,
    {
      provide: USAGE_REPOSITORY,
      inject: [ConfigService, PostgresUsageRepository],
      useFactory: (
        configService: ConfigService<ApiEnv, true>,
        postgresUsageRepository: PostgresUsageRepository,
      ) => {
        return configService.get('NODE_ENV', { infer: true }) === 'test'
          ? new InMemoryUsageRepository()
          : postgresUsageRepository
      },
    },
  ],
  exports: [UsageService],
})
export class UsageModule {}
