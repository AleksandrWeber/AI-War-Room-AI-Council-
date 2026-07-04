import { Controller, Get } from '@nestjs/common'
import { ModelRouterService } from './model-router.service.js'

@Controller('model-router')
export class ModelRouterController {
  constructor(private readonly modelRouterService: ModelRouterService) {}

  @Get('registry')
  getRegistry() {
    return {
      models: this.modelRouterService.getRegistrySnapshot(),
    }
  }
}
