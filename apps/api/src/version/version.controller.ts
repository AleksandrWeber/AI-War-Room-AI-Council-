import { Controller, Get } from '@nestjs/common'

@Controller('version')
export class VersionController {
  @Get()
  getVersion() {
    return {
      name: 'AI War Room API',
      version: '0.0.0',
    }
  }
}
