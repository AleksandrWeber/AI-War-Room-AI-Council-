import { Injectable } from '@nestjs/common'

export type HealthStatus = {
  service: 'ai-war-room-api'
  status: 'ok'
  version: string
}

@Injectable()
export class HealthService {
  getStatus(): HealthStatus {
    return {
      service: 'ai-war-room-api',
      status: 'ok',
      version: '0.0.0',
    }
  }
}
