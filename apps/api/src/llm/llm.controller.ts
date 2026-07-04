import { Controller, Get } from '@nestjs/common'
import { LlmService } from './llm.service.js'

@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @Get('capabilities')
  getCapabilities() {
    return this.llmService.getCapabilities()
  }

  @Get('readiness')
  getLlmRollout() {
    return this.llmService.getLlmRollout()
  }
}
