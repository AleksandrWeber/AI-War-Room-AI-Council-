import { Body, Controller, Get, Post } from '@nestjs/common'
import { RunsService } from './runs.service.js'

@Controller('runs')
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  @Get('capabilities')
  getCapabilities() {
    return this.runsService.getCapabilities()
  }

  @Post('draft')
  createDraftRun(@Body() body: unknown) {
    return this.runsService.createDraftRun(body)
  }
}
