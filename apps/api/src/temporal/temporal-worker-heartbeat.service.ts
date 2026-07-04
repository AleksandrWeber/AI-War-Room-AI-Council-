import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, type RedisClientType } from 'redis'
import type { ApiEnv } from '../config/env.js'

type WorkerHeartbeatRecord = {
  taskQueue: string
  lastSeenAt: string
}

@Injectable()
export class TemporalWorkerHeartbeatService implements OnModuleDestroy {
  private readonly localHeartbeats = new Map<string, WorkerHeartbeatRecord>()
  private readonly redisClient: RedisClientType | null
  private readonly heartbeatTtlSeconds = 90

  constructor(configService: ConfigService<ApiEnv, true>) {
    const nodeEnv = configService.get('NODE_ENV', { infer: true })

    this.redisClient =
      nodeEnv === 'test'
        ? null
        : createClient({
            url: configService.get('REDIS_URL', { infer: true }),
          })
  }

  async recordHeartbeat(taskQueue: string) {
    const record: WorkerHeartbeatRecord = {
      taskQueue,
      lastSeenAt: new Date().toISOString(),
    }

    if (!this.redisClient) {
      this.localHeartbeats.set(taskQueue, record)
      return record
    }

    try {
      if (!this.redisClient.isOpen) {
        await this.redisClient.connect()
      }

      await this.redisClient.set(
        this.createKey(taskQueue),
        JSON.stringify(record),
        {
          EX: this.heartbeatTtlSeconds,
        },
      )
    } catch {
      this.localHeartbeats.set(taskQueue, record)
    }

    return record
  }

  async getLatestHeartbeat(taskQueue: string) {
    if (!this.redisClient) {
      return this.localHeartbeats.get(taskQueue) ?? null
    }

    try {
      if (!this.redisClient.isOpen) {
        await this.redisClient.connect()
      }

      const value = await this.redisClient.get(this.createKey(taskQueue))

      if (!value) {
        return this.localHeartbeats.get(taskQueue) ?? null
      }

      return JSON.parse(value) as WorkerHeartbeatRecord
    } catch {
      return this.localHeartbeats.get(taskQueue) ?? null
    }
  }

  isRecentHeartbeat(lastSeenAt: string, maxAgeMs = 90_000) {
    return Date.now() - Date.parse(lastSeenAt) < maxAgeMs
  }

  async onModuleDestroy() {
    if (this.redisClient?.isOpen) {
      await this.redisClient.quit()
    }
  }

  private createKey(taskQueue: string) {
    return `temporal:worker:heartbeat:${taskQueue}`
  }
}
