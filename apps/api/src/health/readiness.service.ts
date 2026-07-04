import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { readinessResponseSchema } from '@ai-war-room/schemas'
import { PostgresService } from '../persistence/postgres.service.js'
import { StreamEventBufferService } from '../persistence/stream-event-buffer.service.js'

@Injectable()
export class ReadinessService {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly streamEventBufferService: StreamEventBufferService,
  ) {}

  async getReadiness() {
    const dependencies = await Promise.all([
      this.checkPostgres(),
      this.checkRedis(),
    ])
    const status = dependencies.every((dependency) => dependency.status === 'up')
      ? 'ready'
      : 'not_ready'

    return readinessResponseSchema.parse({
      service: 'ai-war-room-api',
      status,
      dependencies,
      checkedAt: new Date().toISOString(),
    })
  }

  async requireReady() {
    const readiness = await this.getReadiness()

    if (readiness.status !== 'ready') {
      throw new ServiceUnavailableException(readiness)
    }

    return readiness
  }

  private async checkPostgres() {
    try {
      await this.postgresService.ping()

      return {
        name: 'postgres' as const,
        status: 'up' as const,
      }
    } catch (error) {
      return {
        name: 'postgres' as const,
        status: 'down' as const,
        detail:
          error instanceof Error
            ? error.message
            : 'PostgreSQL readiness check failed.',
      }
    }
  }

  private async checkRedis() {
    try {
      const isUp = await this.streamEventBufferService.ping()

      if (!isUp) {
        return {
          name: 'redis' as const,
          status: 'down' as const,
          detail: 'Redis ping did not return PONG.',
        }
      }

      return {
        name: 'redis' as const,
        status: 'up' as const,
      }
    } catch (error) {
      return {
        name: 'redis' as const,
        status: 'down' as const,
        detail:
          error instanceof Error ? error.message : 'Redis readiness check failed.',
      }
    }
  }
}
