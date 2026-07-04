import { Controller, Get } from '@nestjs/common'
import { HealthService } from './health.service.js'
import { ReadinessService } from './readiness.service.js'

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly readinessService: ReadinessService,
  ) {}

  @Get()
  getHealth() {
    return this.healthService.getStatus()
  }

  @Get('ready')
  getReadiness() {
    return this.readinessService.requireReady()
  }
}
