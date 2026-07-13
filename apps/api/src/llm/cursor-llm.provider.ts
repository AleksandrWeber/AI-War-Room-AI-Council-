import { mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Agent, CursorAgentError } from '@cursor/sdk'
import type { ApiEnv } from '../config/env.js'
import type {
  LlmMessage,
  LlmProvider,
  LlmProviderRequest,
  LlmProviderResponse,
} from './llm.types.js'
import { createUsage } from './llm.utils.js'

@Injectable()
export class CursorLlmProvider implements LlmProvider {
  readonly providerId = 'cursor' as const

  constructor(private readonly configService: ConfigService<ApiEnv, true>) {}

  async completeJson(
    request: LlmProviderRequest,
  ): Promise<LlmProviderResponse> {
    const apiKey =
      request.apiKeyOverride ??
      this.configService.get('CURSOR_API_KEY', { infer: true })

    if (!apiKey) {
      throw new Error('CURSOR_API_KEY is required for Cursor provider.')
    }

    const timeoutMs = this.configService.get('CURSOR_REQUEST_TIMEOUT_MS', {
      infer: true,
    })
    const runtime = this.configService.get('CURSOR_RUNTIME', { infer: true })
    const prompt = this.createPrompt(request.messages)

    try {
      const result = await this.withTimeout(
        Agent.prompt(prompt, {
          apiKey,
          model: { id: request.model },
          mode: 'plan',
          ...(runtime === 'cloud'
            ? { cloud: {} }
            : { local: { cwd: this.resolveLocalCwd() } }),
        }),
        timeoutMs,
      )

      if (result.status === 'error') {
        throw new Error(
          `Cursor provider failed: ${result.error?.message ?? 'unknown error'}`,
        )
      }

      const rawText = this.extractJsonText(result.result)

      if (!rawText) {
        throw new Error('Cursor provider returned no JSON content.')
      }

      const inputTokens = result.usage?.inputTokens ?? 0
      const outputTokens = result.usage?.outputTokens ?? 0
      const usage = createUsage(inputTokens, outputTokens)

      return {
        rawText,
        usage: {
          ...usage,
          estimatedCostUsd: this.estimateCostUsd(inputTokens, outputTokens),
        },
        providerId: this.providerId,
        model: request.model,
      }
    } catch (error) {
      if (error instanceof CursorAgentError) {
        throw new Error(`Cursor provider failed: ${error.message}`)
      }

      throw error
    }
  }

  private createPrompt(messages: LlmMessage[]) {
    const transcript = messages
      .map((message) => `${message.role.toUpperCase()}:\n${message.content}`)
      .join('\n\n')

    return [
      'You are a JSON completion API used by an application pipeline.',
      'Do not edit files, run tools, or explore a repository.',
      'Return only one valid JSON object. No markdown fences. No prose before or after the JSON.',
      '',
      transcript,
    ].join('\n')
  }

  private extractJsonText(raw: string | undefined) {
    if (!raw) {
      return ''
    }

    const trimmed = raw.trim()
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)

    if (fenced?.[1]) {
      return fenced[1].trim()
    }

    const start = trimmed.indexOf('{')
    const end = trimmed.lastIndexOf('}')

    if (start >= 0 && end > start) {
      return trimmed.slice(start, end + 1)
    }

    return trimmed
  }

  private resolveLocalCwd() {
    const configured = this.configService.get('CURSOR_LOCAL_CWD', {
      infer: true,
    })
    const cwd =
      configured || join(tmpdir(), 'ai-war-room-cursor-llm-workspace')
    mkdirSync(cwd, { recursive: true })
    return cwd
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Cursor provider timed out after ${timeoutMs}ms.`))
      }, timeoutMs)

      promise.then(
        (value) => {
          clearTimeout(timer)
          resolve(value)
        },
        (error: unknown) => {
          clearTimeout(timer)
          reject(error)
        },
      )
    })
  }

  private estimateCostUsd(inputTokens: number, outputTokens: number) {
    // Approximate Composer-class pricing placeholder for usage accounting.
    const inputPerMillion = 3
    const outputPerMillion = 15

    return (
      (inputTokens / 1_000_000) * inputPerMillion +
      (outputTokens / 1_000_000) * outputPerMillion
    )
  }
}
