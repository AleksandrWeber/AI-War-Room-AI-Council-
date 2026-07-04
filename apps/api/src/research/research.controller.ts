import { Controller, Get } from '@nestjs/common'
import { ResearchRolloutService } from './research-rollout.service.js'

@Controller('research')
export class ResearchController {
  constructor(private readonly researchRolloutService: ResearchRolloutService) {}

  @Get('capabilities')
  getCapabilities() {
    return this.researchRolloutService.getCapabilities()
  }

  @Get('readiness')
  getResearchRollout() {
    return this.researchRolloutService.getResearchRollout()
  }
}
