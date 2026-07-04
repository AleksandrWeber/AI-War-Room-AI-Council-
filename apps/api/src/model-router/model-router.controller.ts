import { Controller, Get, Param, Post } from '@nestjs/common'
import { ModelRouterService } from './model-router.service.js'

@Controller('model-router')
export class ModelRouterController {
  constructor(private readonly modelRouterService: ModelRouterService) {}

  @Get('registry')
  getRegistry() {
    return this.modelRouterService
      .getRegistrySnapshot()
      .then((models) => ({ models }))
  }

  @Get('registry/:modelId/health-events')
  getHealthEvents(@Param('modelId') modelId: string) {
    return this.modelRouterService
      .getHealthEvents(modelId)
      .then((events) => ({ modelId, events }))
  }

  @Post('registry/:modelId/recover')
  recoverModel(@Param('modelId') modelId: string) {
    return this.modelRouterService.recoverModel(modelId)
  }
}
