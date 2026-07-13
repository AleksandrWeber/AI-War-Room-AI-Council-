import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { readinessResponseSchema } from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { PostgresService } from '../persistence/postgres.service.js'
import { StreamEventBufferService } from '../persistence/stream-event-buffer.service.js'
import { TemporalHealthService } from '../temporal/temporal-health.service.js'
import { getTemporalWorkerConfig } from '../temporal/temporal-worker.config.js'

@Injectable()
export class ReadinessService {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly streamEventBufferService: StreamEventBufferService,
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly temporalHealthService: TemporalHealthService,
  ) {}

  async getReadiness() {
    const dependencies = await Promise.all([
      this.checkPostgres(),
      this.checkRedis(),
      this.checkTemporal(),
    ])
    const requiredDependencies = dependencies.filter(
      (dependency) => dependency !== null,
    )
    const status = requiredDependencies.every(
      (dependency) => dependency.status === 'up',
    )
      ? 'ready'
      : 'not_ready'

    return readinessResponseSchema.parse({
      service: 'ai-war-room-api',
      status,
      dependencies: requiredDependencies,
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

  private async checkTemporal() {
    const workerConfig = getTemporalWorkerConfig(this.configService)

    if (!workerConfig.enabled) {
      return null
    }

    try {
      const health = await this.temporalHealthService.getRuntimeHealth()

      if (!health.serverReachable) {
        return {
          name: 'temporal' as const,
          status: 'down' as const,
          detail:
            health.guidance ||
            'Temporal server is not reachable while TEMPORAL_ENABLED=true.',
        }
      }

      return {
        name: 'temporal' as const,
        status: 'up' as const,
      }
    } catch (error) {
      return {
        name: 'temporal' as const,
        status: 'down' as const,
        detail:
          error instanceof Error
            ? error.message
            : 'Temporal readiness check failed.',
      }
    }
  }
}
