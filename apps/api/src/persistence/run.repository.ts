import type {
  ArtifactHistoryItem,
  DraftRun,
  IdempotencyRecord,
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
  listArtifacts(workspaceId: string): Promise<ArtifactHistoryItem[]>
  listIdempotencyRecords(workspaceId: string): Promise<IdempotencyRecord[]>
  purgeExpiredIdempotencyKeys(workspaceId: string): Promise<number>
  findArtifactById(
    workspaceId: string,
    artifactId: string,
  ): Promise<ArtifactHistoryItem | null>
}
