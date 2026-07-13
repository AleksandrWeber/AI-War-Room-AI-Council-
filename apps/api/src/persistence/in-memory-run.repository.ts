import type {
  ArtifactHistoryItem,
  DraftRun,
  IdempotencyRecord,
  MockPipelineResult,
} from '@ai-war-room/schemas'
import type {
  RunRepository,
  SaveDraftRunInput,
} from './run.repository.js'

export class InMemoryRunRepository implements RunRepository {
  private readonly draftsByIdempotencyKey = new Map<string, DraftRun>()
  private readonly idempotencyExpiresAtByKey = new Map<string, string>()
  private readonly pipelineResultsByRunId = new Map<string, MockPipelineResult>()

  async findDraftRunByIdempotencyKey(
    workspaceId: string,
    idempotencyKey: string,
  ): Promise<DraftRun | null> {
    const key = this.createIdempotencyKey(workspaceId, idempotencyKey)
    const expiresAt = this.idempotencyExpiresAtByKey.get(key)

    if (expiresAt && Date.parse(expiresAt) <= Date.now()) {
      return null
    }

    return this.draftsByIdempotencyKey.get(key) ?? null
  }

  async saveDraftRun(input: SaveDraftRunInput): Promise<void> {
    const key = this.createIdempotencyKey(
      input.draftRun.workspaceId,
      input.idempotencyKey,
    )
    this.draftsByIdempotencyKey.set(key, input.draftRun)
    this.idempotencyExpiresAtByKey.set(
      key,
      new Date(Date.now() + input.idempotencyTtlSeconds * 1000).toISOString(),
    )
  }

  async saveMockPipelineResult(result: MockPipelineResult): Promise<void> {
    this.pipelineResultsByRunId.set(result.runId, result)
  }

  async listArtifacts(workspaceId: string): Promise<ArtifactHistoryItem[]> {
    return [...this.pipelineResultsByRunId.values()]
      .filter((result) => result.workspaceId === workspaceId)
      .flatMap((result) =>
        result.artifacts.map((artifact) => ({
          artifactId: artifact.metadata.artifactId,
          runId: artifact.metadata.runId,
          workspaceId: artifact.metadata.workspaceId,
          artifactType: artifact.metadata.artifactType,
          artifactVersion: artifact.metadata.artifactVersion,
          createdAt: artifact.metadata.createdAt,
          metadata: artifact.metadata,
          artifact: artifact.artifact,
        })),
      )
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  }

  async listIdempotencyRecords(workspaceId: string): Promise<IdempotencyRecord[]> {
    const now = Date.now()

    return [...this.draftsByIdempotencyKey.entries()]
      .filter(([key]) => key.startsWith(`${workspaceId}:`))
      .map(([key, draft]) => {
        const expiresAt =
          this.idempotencyExpiresAtByKey.get(key) ?? draft.updatedAt

        return {
          idempotencyKey: key.slice(workspaceId.length + 1),
          runId: draft.runId,
          expiresAt,
          expired: Date.parse(expiresAt) <= now,
        }
      })
      .sort((left, right) => right.expiresAt.localeCompare(left.expiresAt))
      .slice(0, 20)
  }

  async purgeExpiredIdempotencyKeys(workspaceId: string): Promise<number> {
    const now = Date.now()
    let purgedCount = 0

    for (const [key, expiresAt] of this.idempotencyExpiresAtByKey.entries()) {
      if (!key.startsWith(`${workspaceId}:`)) {
        continue
      }

      if (Date.parse(expiresAt) > now) {
        continue
      }

      this.idempotencyExpiresAtByKey.delete(key)
      this.draftsByIdempotencyKey.delete(key)
      purgedCount += 1
    }

    return purgedCount
  }

  async findArtifactById(
    workspaceId: string,
    artifactId: string,
  ): Promise<ArtifactHistoryItem | null> {
    return (
      (await this.listArtifacts(workspaceId)).find(
        (artifact) => artifact.artifactId === artifactId,
      ) ?? null
    )
  }

  private createIdempotencyKey(workspaceId: string, idempotencyKey: string) {
    return `${workspaceId}:${idempotencyKey}`
  }
}
