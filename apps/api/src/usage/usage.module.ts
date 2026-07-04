import { Module, forwardRef } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { ApiEnv } from '../config/env.js'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { InMemoryUsageRepository } from './in-memory-usage.repository.js'
import { PostgresUsageRepository } from './postgres-usage.repository.js'
import { UsageController } from './usage.controller.js'
import { UsageService } from './usage.service.js'
import { USAGE_REPOSITORY } from './usage.repository.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    forwardRef(() => WorkspacesModule),
  ],
  controllers: [UsageController],
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
  exports: [UsageService, USAGE_REPOSITORY],
})
export class UsageModule {}
