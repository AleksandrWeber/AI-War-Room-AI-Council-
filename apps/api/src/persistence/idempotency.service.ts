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
      return this.reserveLocal(key)
    }
  }

  usesRedisBackedReservation() {
    return this.redisClient !== null
  }

  async ping() {
    if (!this.redisClient) {
      return true
    }

    try {
      if (!this.redisClient.isOpen) {
        await this.redisClient.connect()
      }

      const response = await this.redisClient.ping()

      return response === 'PONG'
    } catch {
      return false
    }
  }

  async listWorkspaceReservations(workspaceId: string) {
    const prefix = this.createWorkspacePrefix(workspaceId)

    if (!this.redisClient) {
      return [...this.localReservations]
        .filter((key) => key.startsWith(prefix))
        .map((key) => ({
          idempotencyKey: key.slice(prefix.length),
        }))
    }

    try {
      if (!this.redisClient.isOpen) {
        await this.redisClient.connect()
      }

      const keys = await this.scanRedisKeys(`${prefix}*`)

      return keys.map((key) => ({
        idempotencyKey: key.slice(prefix.length),
      }))
    } catch {
      return [...this.localReservations]
        .filter((key) => key.startsWith(prefix))
        .map((key) => ({
          idempotencyKey: key.slice(prefix.length),
        }))
    }
  }

  async clearWorkspaceReservations(workspaceId: string) {
    const prefix = this.createWorkspacePrefix(workspaceId)
    let clearedCount = 0

    if (!this.redisClient) {
      for (const key of this.localReservations) {
        if (!key.startsWith(prefix)) {
          continue
        }

        this.localReservations.delete(key)
        clearedCount += 1
      }

      return clearedCount
    }

    try {
      if (!this.redisClient.isOpen) {
        await this.redisClient.connect()
      }

      const keys = await this.scanRedisKeys(`${prefix}*`)

      for (const key of keys) {
        await this.redisClient.del(key)
        clearedCount += 1
      }
    } catch {
      for (const key of this.localReservations) {
        if (!key.startsWith(prefix)) {
          continue
        }

        this.localReservations.delete(key)
        clearedCount += 1
      }
    }

    return clearedCount
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

  private async scanRedisKeys(pattern: string) {
    if (!this.redisClient) {
      return []
    }

    const keys: string[] = []
    let cursor = '0'

    do {
      const result = (await this.redisClient.sendCommand([
        'SCAN',
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        '100',
      ])) as [string, string[]]

      cursor = result[0]
      keys.push(...result[1])
    } while (cursor !== '0')

    return keys
  }

  private createKey(workspaceId: string, idempotencyKey: string) {
    return `${this.createWorkspacePrefix(workspaceId)}${idempotencyKey}`
  }

  private createWorkspacePrefix(workspaceId: string) {
    return `idempotency:${workspaceId}:`
  }
}
