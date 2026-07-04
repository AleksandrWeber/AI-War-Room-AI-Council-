import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, type RedisClientType } from 'redis'
import type { ApiEnv } from '../config/env.js'
import type { PipelineStreamEvent } from '../runs/pipeline-stream-event.js'

type BufferedStreamEvent = {
  eventId: string
  event: PipelineStreamEvent
}

@Injectable()
export class StreamEventBufferService implements OnModuleDestroy {
  private readonly localStreams = new Map<string, BufferedStreamEvent[]>()
  private readonly redisClient: RedisClientType | null
  private localSequence = 0

  constructor(configService: ConfigService<ApiEnv, true>) {
    const nodeEnv = configService.get('NODE_ENV', { infer: true })

    this.redisClient =
      nodeEnv === 'test'
        ? null
        : createClient({
            url: configService.get('REDIS_URL', { infer: true }),
          })
  }

  async append(input: {
    workspaceId: string
    runId: string
    event: PipelineStreamEvent
  }): Promise<PipelineStreamEvent> {
    const key = this.createKey(input.workspaceId, input.runId)

    if (!this.redisClient) {
      return this.appendLocal(key, input.event)
    }

    try {
      if (!this.redisClient.isOpen) {
        await this.redisClient.connect()
      }

      const eventId = (await this.redisClient.sendCommand([
        'XADD',
        key,
        'MAXLEN',
        '~',
        '100',
        '*',
        'event',
        JSON.stringify(input.event),
      ])) as string

      return {
        ...input.event,
        eventId,
      }
    } catch {
      return this.appendLocal(key, input.event)
    }
  }

  async replayAfter(input: {
    workspaceId: string
    runId: string
    afterEventId: string
  }): Promise<PipelineStreamEvent[]> {
    const key = this.createKey(input.workspaceId, input.runId)

    if (!this.redisClient) {
      return this.replayLocal(key, input.afterEventId)
    }

    try {
      if (!this.redisClient.isOpen) {
        await this.redisClient.connect()
      }

      const result = await this.redisClient.sendCommand([
        'XRANGE',
        key,
        `(${input.afterEventId}`,
        '+',
      ])

      return this.parseRedisRange(result)
    } catch {
      return this.replayLocal(key, input.afterEventId)
    }
  }

  async replayAll(input: {
    workspaceId: string
    runId: string
  }): Promise<PipelineStreamEvent[]> {
    const key = this.createKey(input.workspaceId, input.runId)

    if (!this.redisClient) {
      return (this.localStreams.get(key) ?? []).map((entry) => entry.event)
    }

    try {
      if (!this.redisClient.isOpen) {
        await this.redisClient.connect()
      }

      const result = await this.redisClient.sendCommand(['XRANGE', key, '-', '+'])

      return this.parseRedisRange(result)
    } catch {
      return (this.localStreams.get(key) ?? []).map((entry) => entry.event)
    }
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

  async onModuleDestroy() {
    if (this.redisClient?.isOpen) {
      await this.redisClient.quit()
    }
  }

  private appendLocal(key: string, event: PipelineStreamEvent) {
    const eventId = `${Date.now()}-${++this.localSequence}`
    const persistedEvent = {
      ...event,
      eventId,
    }
    const events = this.localStreams.get(key) ?? []
    events.push({
      eventId,
      event: persistedEvent,
    })
    this.localStreams.set(key, events.slice(-100))

    return persistedEvent
  }

  private replayLocal(key: string, afterEventId: string) {
    const events = this.localStreams.get(key) ?? []

    return events
      .filter((entry) => this.compareStreamIds(entry.eventId, afterEventId) > 0)
      .map((entry) => entry.event)
  }

  private parseRedisRange(result: unknown): PipelineStreamEvent[] {
    if (!Array.isArray(result)) {
      return []
    }

    return result.flatMap((entry) => {
      if (!Array.isArray(entry)) {
        return []
      }

      const [eventId, fields] = entry as [string, unknown]
      const eventJson = this.getEventJson(fields)

      if (!eventJson) {
        return []
      }

      try {
        const event = JSON.parse(eventJson) as PipelineStreamEvent

        return [
          {
            ...event,
            eventId,
          },
        ]
      } catch {
        return []
      }
    })
  }

  private getEventJson(fields: unknown) {
    if (Array.isArray(fields)) {
      for (let index = 0; index < fields.length; index += 2) {
        if (fields[index] === 'event' && typeof fields[index + 1] === 'string') {
          return fields[index + 1]
        }
      }
    }

    if (
      typeof fields === 'object' &&
      fields !== null &&
      'event' in fields &&
      typeof fields.event === 'string'
    ) {
      return fields.event
    }

    return null
  }

  private compareStreamIds(left: string, right: string) {
    const [leftTime, leftSequence] = this.parseStreamId(left)
    const [rightTime, rightSequence] = this.parseStreamId(right)

    if (leftTime !== rightTime) {
      return leftTime - rightTime
    }

    return leftSequence - rightSequence
  }

  private parseStreamId(value: string) {
    const [time = '0', sequence = '0'] = value.split('-')

    return [Number(time), Number(sequence)] as const
  }

  private createKey(workspaceId: string, runId: string) {
    return `runs:stream:${workspaceId}:${runId}`
  }
}
