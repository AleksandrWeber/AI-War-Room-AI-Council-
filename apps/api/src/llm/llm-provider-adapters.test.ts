import { ConfigService } from '@nestjs/config'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { AnthropicLlmProvider } from './anthropic-llm.provider.js'
import { GeminiLlmProvider } from './gemini-llm.provider.js'
import type { LlmProviderRequest } from './llm.types.js'
import { OpenAiLlmProvider } from './openai-llm.provider.js'

const request: LlmProviderRequest = {
  taskName: 'test',
  model: 'test-model',
  responseFormat: 'json_object',
  messages: [
    { role: 'system', content: 'You are a strict JSON generator.' },
    { role: 'user', content: 'Return {"ok": true}.' },
  ],
}

function createConfig(overrides: Partial<ApiEnv>) {
  return new ConfigService<ApiEnv>({
    LLM_REQUEST_TIMEOUT_MS: 30_000,
    ANTHROPIC_API_URL: 'https://anthropic.test/v1/messages',
    OPENAI_API_URL: 'https://openai.test/v1/chat/completions',
    GEMINI_API_URL: 'https://gemini.test/v1beta',
    ...overrides,
  })
}

describe('LLM provider adapters', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends Anthropic messages and extracts JSON text with usage', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ type: 'text', text: '{"ok":true}' }],
        usage: { input_tokens: 12, output_tokens: 5 },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const provider = new AnthropicLlmProvider(
      createConfig({ ANTHROPIC_API_KEY: 'test-key' }) as never,
    )
    const result = await provider.completeJson(request)
    const [, init] = fetchMock.mock.calls[0]
    const body = JSON.parse(String(init.body)) as {
      system: string
      messages: Array<{ role: string; content: string }>
    }

    expect(result.rawText).toBe('{"ok":true}')
    expect(result.usage.inputTokens).toBe(12)
    expect(result.usage.outputTokens).toBe(5)
    expect(init.headers['x-api-key']).toBe('test-key')
    expect(body.system).toContain('strict JSON generator')
    expect(body.messages).toEqual([
      { role: 'user', content: 'Return {"ok": true}.' },
    ])
  })

  it('sends OpenAI chat completions with JSON response format', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '{"ok":true}' } }],
        usage: { prompt_tokens: 20, completion_tokens: 7 },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const provider = new OpenAiLlmProvider(
      createConfig({ OPENAI_API_KEY: 'test-key' }) as never,
    )
    const result = await provider.completeJson(request)
    const [, init] = fetchMock.mock.calls[0]
    const body = JSON.parse(String(init.body)) as {
      response_format: { type: string }
      messages: Array<{ role: string; content: string }>
    }

    expect(result.rawText).toBe('{"ok":true}')
    expect(result.usage.inputTokens).toBe(20)
    expect(result.usage.outputTokens).toBe(7)
    expect(init.headers.authorization).toBe('Bearer test-key')
    expect(body.response_format).toEqual({ type: 'json_object' })
    expect(body.messages.some((message) => message.role === 'system')).toBe(true)
  })

  it('sends Gemini generateContent with JSON mime type', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '{"ok":true}' }] } }],
        usageMetadata: { promptTokenCount: 15, candidatesTokenCount: 4 },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const provider = new GeminiLlmProvider(
      createConfig({ GEMINI_API_KEY: 'test-key' }) as never,
    )
    const result = await provider.completeJson({
      ...request,
      model: 'gemini-2.0-flash',
    })
    const [url, init] = fetchMock.mock.calls[0]
    const body = JSON.parse(String(init.body)) as {
      systemInstruction: { parts: Array<{ text: string }> }
      contents: Array<{ role: string; parts: Array<{ text: string }> }>
      generationConfig: { responseMimeType: string }
    }

    expect(result.rawText).toBe('{"ok":true}')
    expect(result.usage.inputTokens).toBe(15)
    expect(result.usage.outputTokens).toBe(4)
    expect(url).toBe(
      'https://gemini.test/v1beta/models/gemini-2.0-flash:generateContent',
    )
    expect(init.headers['x-goog-api-key']).toBe('test-key')
    expect(body.generationConfig.responseMimeType).toBe('application/json')
    expect(body.systemInstruction.parts[0]?.text).toContain(
      'strict JSON generator',
    )
    expect(body.contents).toEqual([
      { role: 'user', parts: [{ text: 'Return {"ok": true}.' }] },
    ])
  })

  it('fails fast when a configured real provider is missing its API key', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const provider = new AnthropicLlmProvider(createConfig({}) as never)

    await expect(provider.completeJson(request)).rejects.toThrow(
      'ANTHROPIC_API_KEY is required',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
