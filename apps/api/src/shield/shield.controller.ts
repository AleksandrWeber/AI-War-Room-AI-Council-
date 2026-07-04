import { Controller, Get } from '@nestjs/common'
import { AdvancedShieldService } from './advanced-shield.service.js'

@Controller('shield')
export class ShieldController {
  constructor(private readonly advancedShieldService: AdvancedShieldService) {}

  @Get('review-summary')
  getReviewSummary() {
    return this.advancedShieldService.getReviewSummary()
  }
}
