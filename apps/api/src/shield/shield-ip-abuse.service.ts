import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleDestroy,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, type RedisClientType } from 'redis'
import type { ApiEnv } from '../config/env.js'
import { ObservabilityService } from '../observability/observability.service.js'

const MAX_CRITICAL_ATTEMPTS = 3
const FIRST_BLOCK_SECONDS = 2 * 60 * 60
const REPEAT_BLOCK_SECONDS = 24 * 60 * 60
const STRIKE_WINDOW_SECONDS = 24 * 60 * 60
const TIER_RETENTION_SECONDS = 7 * 24 * 60 * 60

type LocalStrikeState = {
  strikes: number
  expiresAtMs: number
}

type LocalBlockState = {
  untilMs: number
  durationSeconds: number
}

type LocalTierState = {
  tier: number
  expiresAtMs: number
}

export type CriticalAttemptResult = {
  strikes: number
  blocked: boolean
  blockDurationSeconds: number | null
  retryAfterSeconds: number | null
}

@Injectable()
export class ShieldIpAbuseService implements OnModuleDestroy {
  private readonly redisClient: RedisClientType | null
  private readonly localStrikes = new Map<string, LocalStrikeState>()
  private readonly localBlocks = new Map<string, LocalBlockState>()
  private readonly localTiers = new Map<string, LocalTierState>()

  constructor(
    configService: ConfigService<ApiEnv, true>,
    private readonly observabilityService: ObservabilityService,
  ) {
    const nodeEnv = configService.get('NODE_ENV', { infer: true })

    this.redisClient =
      nodeEnv === 'test'
        ? null
        : createClient({
            url: configService.get('REDIS_URL', { infer: true }),
          })
  }

  async assertIpAllowed(clientIp: string) {
    const normalizedIp = this.normalizeIp(clientIp)
    const block = await this.getActiveBlock(normalizedIp)

    if (!block) {
      return
    }

    this.observabilityService.record(
      'shield_abuse_signal',
      {
        clientIp: normalizedIp,
        quotaImpact: 'ip_rate_limited',
        retryAfterSeconds: block.retryAfterSeconds,
        blockDurationSeconds: block.durationSeconds,
      },
      'warn',
    )

    throw new HttpException(
      {
        message: this.formatBlockMessage(block.retryAfterSeconds),
        code: 'ip_threat_rate_limited',
        retryAfterSeconds: block.retryAfterSeconds,
        blockDurationSeconds: block.durationSeconds,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    )
  }

  async recordCriticalAttempt(clientIp: string): Promise<CriticalAttemptResult> {
    const normalizedIp = this.normalizeIp(clientIp)
    const strikes = await this.incrementStrikes(normalizedIp)

    if (strikes < MAX_CRITICAL_ATTEMPTS) {
      return {
        strikes,
        blocked: false,
        blockDurationSeconds: null,
        retryAfterSeconds: null,
      }
    }

    const priorTier = await this.getTier(normalizedIp)
    const durationSeconds =
      priorTier >= 1 ? REPEAT_BLOCK_SECONDS : FIRST_BLOCK_SECONDS
    const nextTier = priorTier >= 1 ? 2 : 1

    await this.setBlock(normalizedIp, durationSeconds)
    await this.setTier(normalizedIp, nextTier)
    await this.clearStrikes(normalizedIp)

    this.observabilityService.record(
      'shield_abuse_signal',
      {
        clientIp: normalizedIp,
        quotaImpact:
          durationSeconds === REPEAT_BLOCK_SECONDS
            ? 'ip_blocked_24h'
            : 'ip_blocked_2h',
        strikes: MAX_CRITICAL_ATTEMPTS,
        blockDurationSeconds: durationSeconds,
        tier: nextTier,
      },
      'warn',
    )

    return {
      strikes: MAX_CRITICAL_ATTEMPTS,
      blocked: true,
      blockDurationSeconds: durationSeconds,
      retryAfterSeconds: durationSeconds,
    }
  }

  async onModuleDestroy() {
    if (this.redisClient?.isOpen) {
      await this.redisClient.quit()
    }
  }

  private normalizeIp(clientIp: string) {
    const trimmed = clientIp.trim().toLowerCase()
    return trimmed.length > 0 ? trimmed : 'unknown'
  }

  private formatBlockMessage(retryAfterSeconds: number) {
    const hours = Math.max(1, Math.ceil(retryAfterSeconds / 3600))
    return `Too many dangerous prompts from this network. Try again in about ${hours} hour${hours === 1 ? '' : 's'}.`
  }

  private async getActiveBlock(ip: string): Promise<{
    retryAfterSeconds: number
    durationSeconds: number
  } | null> {
    if (!this.redisClient) {
      return this.getLocalBlock(ip)
    }

    try {
      const client = await this.ensureRedis()
      const [ttl, durationRaw] = await Promise.all([
        client.ttl(this.blockKey(ip)),
        client.get(this.blockKey(ip)),
      ])

      if (ttl <= 0 || !durationRaw) {
        return null
      }

      return {
        retryAfterSeconds: ttl,
        durationSeconds: Number.parseInt(durationRaw, 10) || ttl,
      }
    } catch {
      return this.getLocalBlock(ip)
    }
  }

  private getLocalBlock(ip: string) {
    const block = this.localBlocks.get(ip)

    if (!block) {
      return null
    }

    const retryAfterSeconds = Math.ceil((block.untilMs - Date.now()) / 1000)

    if (retryAfterSeconds <= 0) {
      this.localBlocks.delete(ip)
      return null
    }

    return {
      retryAfterSeconds,
      durationSeconds: block.durationSeconds,
    }
  }

  private async incrementStrikes(ip: string) {
    if (!this.redisClient) {
      return this.incrementLocalStrikes(ip)
    }

    try {
      const client = await this.ensureRedis()
      const key = this.strikesKey(ip)
      const strikes = await client.incr(key)

      if (strikes === 1) {
        await client.expire(key, STRIKE_WINDOW_SECONDS)
      }

      return strikes
    } catch {
      return this.incrementLocalStrikes(ip)
    }
  }

  private incrementLocalStrikes(ip: string) {
    const now = Date.now()
    const current = this.localStrikes.get(ip)

    if (!current || current.expiresAtMs <= now) {
      this.localStrikes.set(ip, {
        strikes: 1,
        expiresAtMs: now + STRIKE_WINDOW_SECONDS * 1000,
      })
      return 1
    }

    const strikes = current.strikes + 1
    this.localStrikes.set(ip, { ...current, strikes })
    return strikes
  }

  private async clearStrikes(ip: string) {
    this.localStrikes.delete(ip)

    if (!this.redisClient) {
      return
    }

    try {
      const client = await this.ensureRedis()
      await client.del(this.strikesKey(ip))
    } catch {
      // local already cleared
    }
  }

  private async setBlock(ip: string, durationSeconds: number) {
    this.localBlocks.set(ip, {
      untilMs: Date.now() + durationSeconds * 1000,
      durationSeconds,
    })

    if (!this.redisClient) {
      return
    }

    try {
      const client = await this.ensureRedis()
      await client.set(this.blockKey(ip), String(durationSeconds), {
        EX: durationSeconds,
      })
    } catch {
      // local block is enough as fallback
    }
  }

  private async getTier(ip: string) {
    if (!this.redisClient) {
      return this.getLocalTier(ip)
    }

    try {
      const client = await this.ensureRedis()
      const raw = await client.get(this.tierKey(ip))
      const parsed = raw ? Number.parseInt(raw, 10) : 0
      return Number.isFinite(parsed) ? parsed : 0
    } catch {
      return this.getLocalTier(ip)
    }
  }

  private getLocalTier(ip: string) {
    const tier = this.localTiers.get(ip)

    if (!tier || tier.expiresAtMs <= Date.now()) {
      this.localTiers.delete(ip)
      return 0
    }

    return tier.tier
  }

  private async setTier(ip: string, tier: number) {
    this.localTiers.set(ip, {
      tier,
      expiresAtMs: Date.now() + TIER_RETENTION_SECONDS * 1000,
    })

    if (!this.redisClient) {
      return
    }

    try {
      const client = await this.ensureRedis()
      await client.set(this.tierKey(ip), String(tier), {
        EX: TIER_RETENTION_SECONDS,
      })
    } catch {
      // local tier is enough as fallback
    }
  }

  private async ensureRedis() {
    if (!this.redisClient) {
      throw new Error('Redis client is not configured.')
    }

    if (!this.redisClient.isOpen) {
      await this.redisClient.connect()
    }

    return this.redisClient
  }

  private strikesKey(ip: string) {
    return `shield:ip:abuse:strikes:${ip}`
  }

  private blockKey(ip: string) {
    return `shield:ip:abuse:block:${ip}`
  }

  private tierKey(ip: string) {
    return `shield:ip:abuse:tier:${ip}`
  }
}
