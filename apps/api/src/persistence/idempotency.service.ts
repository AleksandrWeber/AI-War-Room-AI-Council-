import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, type RedisClientType } from 'redis'
import type { ApiEnv } from '../config/env.js'

@Injectable()
export class IdempotencyService implements OnModuleDestroy {
  private readonly localReservations = new Set<string>()
  private readonly redisClient: RedisClientType | null

  constructor(configService: ConfigService<ApiEnv, true>) {
    const nodeEnv = configService.get('NODE_ENV', { infer: true })

    this.redisClient =
      nodeEnv === 'test'
        ? null
        : createClient({
            url: configService.get('REDIS_URL', { infer: true }),
          })
  }

  async reserve(input: {
    workspaceId: string
    idempotencyKey: string
    ttlSeconds: number
  }) {
    const key = this.createKey(input.workspaceId, input.idempotencyKey)

    if (!this.redisClient) {
      return this.reserveLocal(key)
    }

    try {
      if (!this.redisClient.isOpen) {
        await this.redisClient.connect()
      }

      const result = await this.redisClient.set(key, 'reserved', {
        NX: true,
        EX: input.ttlSeconds,
      })

      return result === 'OK'
    } catch {
      // Local development should keep working when Redis is not started yet.
      return this.reserveLocal(key)
    }
  }

  async onModuleDestroy() {
    if (this.redisClient?.isOpen) {
      await this.redisClient.quit()
    }
  }

  private reserveLocal(key: string) {
    if (this.localReservations.has(key)) {
      return false
    }

    this.localReservations.add(key)
    return true
  }

  private createKey(workspaceId: string, idempotencyKey: string) {
    return `idempotency:${workspaceId}:${idempotencyKey}`
  }
}
