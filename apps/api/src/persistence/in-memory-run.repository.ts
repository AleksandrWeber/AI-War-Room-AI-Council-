import type { DraftRun, MockPipelineResult } from '@ai-war-room/schemas'
import type {
  RunRepository,
  SaveDraftRunInput,
} from './run.repository.js'

export class InMemoryRunRepository implements RunRepository {
  private readonly draftsByIdempotencyKey = new Map<string, DraftRun>()
  private readonly pipelineResultsByRunId = new Map<string, MockPipelineResult>()

  async findDraftRunByIdempotencyKey(
    workspaceId: string,
    idempotencyKey: string,
  ): Promise<DraftRun | null> {
    return (
      this.draftsByIdempotencyKey.get(
        this.createIdempotencyKey(workspaceId, idempotencyKey),
      ) ?? null
    )
  }

  async saveDraftRun(input: SaveDraftRunInput): Promise<void> {
    this.draftsByIdempotencyKey.set(
      this.createIdempotencyKey(
        input.draftRun.workspaceId,
        input.idempotencyKey,
      ),
      input.draftRun,
    )
  }

  async saveMockPipelineResult(result: MockPipelineResult): Promise<void> {
    this.pipelineResultsByRunId.set(result.runId, result)
  }

  private createIdempotencyKey(workspaceId: string, idempotencyKey: string) {
    return `${workspaceId}:${idempotencyKey}`
  }
}
