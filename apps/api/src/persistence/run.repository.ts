import type {
  DraftRun,
  MockPipelineResult,
} from '@ai-war-room/schemas'

export const RUN_REPOSITORY = Symbol('RUN_REPOSITORY')

export type SaveDraftRunInput = {
  draftRun: DraftRun
  idempotencyKey: string
  idempotencyTtlSeconds: number
}

export interface RunRepository {
  findDraftRunByIdempotencyKey(
    workspaceId: string,
    idempotencyKey: string,
  ): Promise<DraftRun | null>
  saveDraftRun(input: SaveDraftRunInput): Promise<void>
  saveMockPipelineResult(result: MockPipelineResult): Promise<void>
}
