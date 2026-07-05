import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, type RedisClientType } from 'redis'
import type { ApiEnv } from '../config/env.js'
import type { PipelineStreamEvent } from '../runs/pipeline-stream-event.js'

export const STREAM_BUFFER_MAX_LENGTH = 100

type BufferedStreamEvent = {
  eventId: string
  event: PipelineStreamEvent
}

export type BufferedStreamSummary = {
  runId: string
  eventCount: number
  lastEvent?: PipelineStreamEvent
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
        String(STREAM_BUFFER_MAX_LENGTH),
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

  usesRedisBackedBuffer() {
    return this.redisClient !== null
  }

  getStreamBufferMaxLength() {
    return STREAM_BUFFER_MAX_LENGTH
  }

  async listWorkspaceBufferedStreams(
    workspaceId: string,
  ): Promise<BufferedStreamSummary[]> {
    const prefix = this.createWorkspacePrefix(workspaceId)

    if (!this.redisClient) {
      return this.listLocalWorkspaceBufferedStreams(prefix)
    }

    try {
      if (!this.redisClient.isOpen) {
        await this.redisClient.connect()
      }

      const keys = await this.scanRedisKeys(`${prefix}*`)
      const summaries = await Promise.all(
        keys.map(async (key) => {
          const runId = key.slice(prefix.length)
          const eventCount = await this.getRedisStreamLength(key)
          const lastEvent = await this.getRedisLastEvent(key)

          return {
            runId,
            eventCount,
            lastEvent,
          }
        }),
      )

      return this.sortBufferedStreamSummaries(summaries)
    } catch {
      return this.listLocalWorkspaceBufferedStreams(prefix)
    }
  }

  async clearWorkspaceStreams(workspaceId: string) {
    const prefix = this.createWorkspacePrefix(workspaceId)
    let clearedCount = 0

    if (!this.redisClient) {
      for (const key of this.localStreams.keys()) {
        if (!key.startsWith(prefix)) {
          continue
        }

        this.localStreams.delete(key)
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
      for (const key of this.localStreams.keys()) {
        if (!key.startsWith(prefix)) {
          continue
        }

        this.localStreams.delete(key)
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
    this.localStreams.set(key, events.slice(-STREAM_BUFFER_MAX_LENGTH))

    return persistedEvent
  }

  private listLocalWorkspaceBufferedStreams(prefix: string) {
    const summaries = [...this.localStreams.entries()]
      .filter(([key]) => key.startsWith(prefix))
      .map(([key, entries]) => {
        const runId = key.slice(prefix.length)
        const lastEntry = entries.at(-1)

        return {
          runId,
          eventCount: entries.length,
          lastEvent: lastEntry?.event,
        }
      })

    return this.sortBufferedStreamSummaries(summaries)
  }

  private sortBufferedStreamSummaries(summaries: BufferedStreamSummary[]) {
    return summaries
      .slice()
      .sort((left, right) => {
        const leftTime = left.lastEvent?.timestamp ?? ''
        const rightTime = right.lastEvent?.timestamp ?? ''

        return rightTime.localeCompare(leftTime)
      })
      .slice(0, 20)
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

  private async getRedisStreamLength(key: string) {
    if (!this.redisClient) {
      return 0
    }

    const length = await this.redisClient.sendCommand(['XLEN', key])

    return typeof length === 'number' ? length : Number(length)
  }

  private async getRedisLastEvent(key: string) {
    if (!this.redisClient) {
      return undefined
    }

    const result = await this.redisClient.sendCommand([
      'XREVRANGE',
      key,
      '+',
      '-',
      'COUNT',
      '1',
    ])
    const events = this.parseRedisRange(result)

    return events.at(-1)
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
    return `${this.createWorkspacePrefix(workspaceId)}${runId}`
  }

  private createWorkspacePrefix(workspaceId: string) {
    return `runs:stream:${workspaceId}:`
  }
}
