import { ConfigService } from '@nestjs/config'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { AnthropicLlmProvider } from './anthropic-llm.provider.js'
import { CursorLlmProvider } from './cursor-llm.provider.js'
import { GeminiLlmProvider } from './gemini-llm.provider.js'
import type { LlmProviderRequest } from './llm.types.js'
import { OpenAiLlmProvider } from './openai-llm.provider.js'
import { OpenRouterLlmProvider } from './openrouter-llm.provider.js'

const agentPromptMock = vi.hoisted(() => vi.fn())

vi.mock('@cursor/sdk', () => ({
  Agent: {
    prompt: agentPromptMock,
  },
  CursorAgentError: class CursorAgentError extends Error {},
}))

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
    CURSOR_RUNTIME: 'local',
    CURSOR_REQUEST_TIMEOUT_MS: 30_000,
    CURSOR_API_ME_URL: 'https://api.cursor.com/v1/me',
    ...overrides,
  })
}

describe('LLM provider adapters', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    agentPromptMock.mockReset()
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

  it('calls Cursor Agent.prompt and extracts JSON from the result', async () => {
    agentPromptMock.mockResolvedValue({
      status: 'finished',
      result: '```json\n{"ok":true}\n```',
      usage: { inputTokens: 20, outputTokens: 4 },
    })

    const provider = new CursorLlmProvider(
      createConfig({ CURSOR_API_KEY: 'crsr_test' }) as never,
    )
    const result = await provider.completeJson({
      ...request,
      model: 'composer-2.5',
    })

    expect(agentPromptMock).toHaveBeenCalledOnce()
    expect(agentPromptMock.mock.calls[0]?.[1]).toMatchObject({
      apiKey: 'crsr_test',
      model: { id: 'composer-2.5' },
      mode: 'plan',
    })
    expect(result.rawText).toBe('{"ok":true}')
    expect(result.providerId).toBe('cursor')
    expect(result.usage.inputTokens).toBe(20)
  })

  it('fails fast when Cursor is missing its API key', async () => {
    const provider = new CursorLlmProvider(createConfig({}) as never)

    await expect(provider.completeJson(request)).rejects.toThrow(
      'CURSOR_API_KEY is required',
    )
    expect(agentPromptMock).not.toHaveBeenCalled()
  })

  it('sends OpenRouter chat completions and extracts JSON text', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '{"ok":true}' } }],
        usage: { prompt_tokens: 11, completion_tokens: 3 },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const provider = new OpenRouterLlmProvider(
      createConfig({
        OPENROUTER_API_KEY: 'sk-or-test',
        OPENROUTER_API_URL: 'https://openrouter.test/api/v1/chat/completions',
        OPENROUTER_HTTP_REFERER: 'http://127.0.0.1:5173',
        OPENROUTER_APP_TITLE: 'AI War Room',
      }) as never,
    )
    const result = await provider.completeJson({
      ...request,
      model: 'openai/gpt-4o-mini',
    })
    const [, init] = fetchMock.mock.calls[0]
    const body = JSON.parse(String(init.body)) as { model: string }

    expect(init.headers.authorization).toBe('Bearer sk-or-test')
    expect(init.headers['HTTP-Referer']).toBe('http://127.0.0.1:5173')
    expect(init.headers['X-Title']).toBe('AI War Room')
    expect(body.model).toBe('openai/gpt-4o-mini')
    expect(result.providerId).toBe('openrouter')
    expect(result.rawText).toBe('{"ok":true}')
  })
})
