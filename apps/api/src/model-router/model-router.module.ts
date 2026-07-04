import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { ApiEnv } from '../config/env.js'
import { ObservabilityModule } from '../observability/observability.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { InMemoryModelRegistryRepository } from './in-memory-model-registry.repository.js'
import {
  MODEL_REGISTRY_REPOSITORY,
  type ModelRegistryRepository,
} from './model-registry.repository.js'
import { ModelRouterController } from './model-router.controller.js'
import { ModelRouterService } from './model-router.service.js'
import { PostgresModelRegistryRepository } from './postgres-model-registry.repository.js'

@Module({
  imports: [ObservabilityModule, PersistenceModule],
  controllers: [ModelRouterController],
  providers: [
    PostgresModelRegistryRepository,
    ModelRouterService,
    {
      provide: MODEL_REGISTRY_REPOSITORY,
      inject: [ConfigService, PostgresModelRegistryRepository],
      useFactory: (
        configService: ConfigService<ApiEnv, true>,
        postgresRepository: PostgresModelRegistryRepository,
      ): ModelRegistryRepository => {
        return configService.get('NODE_ENV', { infer: true }) === 'test'
          ? new InMemoryModelRegistryRepository()
          : postgresRepository
      },
    },
  ],
  exports: [ModelRouterService],
})
export class ModelRouterModule {}
