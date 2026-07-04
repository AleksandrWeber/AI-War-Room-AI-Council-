import { Controller, Get } from '@nestjs/common'
import { RunsService } from './runs.service.js'

@Controller('runs')
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  @Get('capabilities')
  getCapabilities() {
    return this.runsService.getCapabilities()
  }
}
