import { Module } from '@nestjs/common'
import { ObservabilityModule } from '../observability/observability.module.js'
import { ModelRouterController } from './model-router.controller.js'
import { ModelRouterService } from './model-router.service.js'

@Module({
  imports: [ObservabilityModule],
  controllers: [ModelRouterController],
  providers: [ModelRouterService],
  exports: [ModelRouterService],
})
export class ModelRouterModule {}
